const functions = require("firebase-functions");
const fetch = require("node-fetch"); // Use node-fetch for compatibility
require('dotenv').config(); // Load environment variables
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getFirestore } = require('firebase-admin/firestore');

// Access Firebase environment configuration, then regular environment variables, then fallback
const geminiApiKey = functions.config().gemini?.key || 
                    process.env.GEMINI_API_KEY;

// Define constants matching client-side aiConfig
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-1.5-pro"; // Using Pro model for better completions
const COACH_SYSTEM_PROMPT = `You are MicroGoal's AI Coach, designed to help users achieve their goals through:
1. Providing advice and motivation tailored to their specific goals
2. Being concise but encouraging
3. Offering actionable steps they can take
4. Celebrating their progress, no matter how small
5. Helping them overcome challenges and develop better habits
6. Focusing on achievement and progress, not failure or shortcomings`;
const DEFAULT_TEMPERATURE = 0.7;
const MAX_OUTPUT_TOKENS = 1024;

// Initialize Firebase
admin.initializeApp();
const db = getFirestore();

/**
 * Cloud function that acts as a proxy to the Gemini API
 * This provides a fallback method for accessing Gemini in case
 * direct client-side access is restricted or has issues
 */
exports.geminiChatProxy = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to access AI features'
    );
  }

  if (!geminiApiKey) {
    throw new functions.https.HttpsError(
        "internal",
        "Gemini API key is not configured correctly.");
  }

  const {message, chatHistory = [], goals = null} = data;

  if (!message) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a 'message' argument.");
  }

  try {
    // Format chat history
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{text: msg.text}],
    }));

    // Check if this is a goal-specific request with goals data
    let systemPrompt = COACH_SYSTEM_PROMPT;
    
    if (goals) {
      // If client provided goals data, enhance the system prompt with goals context
      const {macroGoals = [], microGoals = []} = goals;
      
      // Format macro goals summary
      const macroGoalsSummary = macroGoals.map(goal => 
        `- ${goal.title}${goal.description ? `: ${goal.description}` : ''}`
      ).join('\n');
      
      // Format micro goals with status and streaks
      const microGoalsSummary = microGoals.map(goal => {
        const statusText = goal.completed ? 'COMPLETED' : 'PENDING';
        const streakText = goal.streak > 0 ? `(${goal.streak} day streak)` : '';
        return `- ${goal.title}: ${statusText} ${streakText}`;
      }).join('\n');
      
      // Build enhanced system prompt with goals data
      systemPrompt = `${COACH_SYSTEM_PROMPT}
      
Here's information about the user's goals and habits:
      
MACRO GOALS:
${macroGoalsSummary || 'No macro goals defined yet.'}

TODAY'S MICRO GOALS:
${microGoalsSummary || 'No micro goals for today.'}

Based on this information, provide personalized coaching advice that acknowledges their progress, 
offers specific advice on their habits, and suggests actionable next steps.`;
    }

    // Prepare messages payload including system prompt
    const messages = [
      {role: "model", parts: [{text: systemPrompt}]},
      ...formattedHistory,
      {role: "user", parts: [{text: message}]},
    ];

    const payload = {
      contents: messages,
      generationConfig: {
        temperature: DEFAULT_TEMPERATURE,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
      safetySettings: [
        {category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
        {category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
        {category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
        {category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
      ],
    };

    const response = await fetch(
        `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", response.status, errorData);
      // Consider more specific error handling if needed
      throw new functions.https.HttpsError(
          "internal", "Failed to get response from Gemini API.");
    }

    const responseData = await response.json();

    if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {responseText: responseData.candidates[0].content.parts[0].text};
    } else {
      console.error("Unexpected API response structure:", responseData);
      throw new functions.https.HttpsError(
          "internal", "Invalid response structure from Gemini API.");
    }
  } catch (error) {
    console.error("Error calling Gemini proxy:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new functions.https.HttpsError(
        "internal", "An unexpected error occurred.");
  }
});

/**
 * Cloud function that specifically provides goal coaching advice
 * This allows for more efficient goal-specific advice without 
 * sending unnecessary chat history
 */
exports.getGoalCoachingAdvice = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to access coaching features'
    );
  }

  if (!geminiApiKey) {
    throw new functions.https.HttpsError(
        "internal",
        "Gemini API key is not configured correctly.");
  }

  const {macroGoals = [], microGoals = []} = data;

  try {
    // Format macro goals summary
    const macroGoalsSummary = macroGoals.map(goal => 
      `- ${goal.title}${goal.description ? `: ${goal.description}` : ''}`
    ).join('\n');
    
    // Format micro goals with status and streaks
    const microGoalsSummary = microGoals.map(goal => {
      const statusText = goal.completed ? 'COMPLETED' : 'PENDING';
      const streakText = goal.streak > 0 ? `(${goal.streak} day streak)` : '';
      return `- ${goal.title}: ${statusText} ${streakText}`;
    }).join('\n');
    
    // Calculate basic completion stats
    const completedGoals = microGoals.filter(goal => goal.completed).length;
    const completionRate = microGoals.length > 0 
      ? Math.round((completedGoals / microGoals.length) * 100) 
      : 0;
      
    // Find most consistent goal (highest streak)
    let mostConsistentHabit = 'None yet';
    const highestStreakGoal = [...microGoals].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
    if (highestStreakGoal && highestStreakGoal.streak > 0) {
      mostConsistentHabit = `${highestStreakGoal.title} (${highestStreakGoal.streak} day streak)`;
    }
    
    // Build prompt with comprehensive context
    const promptText = `${COACH_SYSTEM_PROMPT}

Here's information about the user's goals and habits:

MACRO GOALS:
${macroGoalsSummary || 'No macro goals defined yet.'}

TODAY'S MICRO GOALS:
${microGoalsSummary || 'No micro goals for today.'}

OVERALL STATS:
- Completion rate (today): ${completionRate}%
- Most consistent habit: ${mostConsistentHabit}

Based on this information, provide personalized coaching advice that:
1. Acknowledges their current progress and streaks
2. Offers specific advice on maintaining or improving their habits
3. Provides motivation tailored to their specific goals
4. Suggests actionable next steps`;

    const payload = {
      contents: [
        {role: "user", parts: [{text: promptText}]},
      ],
      generationConfig: {
        temperature: DEFAULT_TEMPERATURE,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
      safetySettings: [
        {category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
        {category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
        {category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
        {category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE"},
      ],
    };

    const response = await fetch(
        `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", response.status, errorData);
      throw new functions.https.HttpsError(
          "internal", "Failed to get response from Gemini API.");
    }

    const responseData = await response.json();

    if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {responseText: responseData.candidates[0].content.parts[0].text};
    } else {
      console.error("Unexpected API response structure:", responseData);
      throw new functions.https.HttpsError(
          "internal", "Invalid response structure from Gemini API.");
    }
  } catch (error) {
    console.error("Error getting goal coaching advice:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new functions.https.HttpsError(
        "internal", "An unexpected error occurred.");
  }
}); 