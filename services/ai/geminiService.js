import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import aiConfig from '../../constants/aiConfig';
import goalService from '../firestore/goalService';

// Initialize API key from environment variables
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  } else if (typeof Cypress !== 'undefined') {
    // Skip API key in Cypress testing environment
    return 'cypress-test-key';
  } else {
    console.error('GEMINI_API_KEY not found in environment variables');
    return null;
  }
};

// Initialize the Gemini API
const initializeGeminiApi = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set the GEMINI_API_KEY environment variable.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Service for interacting with the Gemini API directly
 */
const geminiService = {
  genAI: null,
  model: null,

  initialize: function() {
    try {
      this.genAI = initializeGeminiApi();
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      throw error;
    }
  },

  /**
   * Send a message to the Gemini API
   * 
   * @param {string} message - The user's message
   * @param {Array} chatHistory - Previous messages for context (optional)
   * @returns {Promise<string>} - The AI's response
   */
  async sendMessage(message, chatHistory = []) {
    try {
      if (!this.model) {
        this.initialize();
      }

      const chat = this.model.startChat({
        history: this.formatChatHistory(chatHistory),
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      throw error;
    }
  },
  
  /**
   * Get AI coaching advice based on goals progress and habit completion history
   * 
   * @param {Array} macroGoals - The user's macro goals data
   * @param {Array} microGoals - The user's micro goals data
   * @returns {Promise<string>} - Personalized coaching advice
   */
  async getGoalCoachingAdvice(macroGoals, microGoals) {
    try {
      // Fetch additional completion history for better context
      const completionContext = await this.fetchCompletionContext(microGoals);
      
      // Create a detailed context message for the AI
      const contextMessage = this.createGoalContext(microGoals);
      
      // Use the generic model for more context space
      const model = this.genAI.getGenerativeModel({
        model: aiConfig.GEMINI_MODEL,
        generationConfig: {
          temperature: aiConfig.DEFAULT_TEMPERATURE,
          maxOutputTokens: aiConfig.MAX_OUTPUT_TOKENS,
        }
      });
      
      const promptText = `
${aiConfig.COACH_SYSTEM_PROMPT}

Here's information about the user's goals and habits:
${contextMessage}

Based on this information, provide personalized coaching advice that:
1. Acknowledges their current progress and streaks
2. Highlights patterns in their habit completion
3. Offers specific advice on maintaining or improving their habits
4. Provides motivation tailored to their specific goals
5. Suggests actionable next steps
`;

      const result = await model.generateContent(promptText);
      const response = result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error getting goal coaching advice:', error);
      throw new Error(`AI Coach Error: ${error.message || 'Could not generate coaching advice.'}`);
    }
  },
  
  /**
   * Format chat history for the Gemini API
   * 
   * @param {Array} chatHistory - Array of message objects with text and sender
   * @returns {Array} - Formatted history for Gemini API
   */
  formatChatHistory(messages) {
    return messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
  },
  
  /**
   * Create a detailed context message about the user's goals
   * 
   * @param {Array} macroGoals - Macro goals data
   * @param {Array} microGoals - Micro goals data
   * @returns {string} - Formatted context message
   */
  createGoalContext(goal) {
    return `Goal: ${goal.name}
    Description: ${goal.description || 'No description provided'}
    Category: ${goal.category || 'No category specified'}
    Type: ${goal.type === 'macro' ? 'Long-term goal' : 'Daily habit'}
    ${goal.type === 'macro' ? `Target date: ${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No target date'}` : ''}
    ${goal.type === 'micro' ? `Frequency: ${goal.frequency ? goal.frequency.join(', ') : 'Every day'}` : ''}`;
  },
  
  /**
   * Fetch and analyze habit completion context
   * 
   * @param {Array} microGoals - Current micro goals
   * @returns {Promise<string>} - Completion context message
   */
  async fetchCompletionContext(microGoals) {
    if (microGoals.type === 'macro') {
      // For macro goals
      const totalTasks = microGoals.subtasks ? microGoals.subtasks.length : 0;
      const completedTasks = microGoals.subtasks ? microGoals.subtasks.filter(task => task.completed).length : 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return `Progress: ${completionRate}% complete (${completedTasks}/${totalTasks} tasks completed)
      Remaining time: ${microGoals.targetDate ? this.calculateRemainingTime(microGoals.targetDate) : 'No deadline set'}`;
    } else {
      // For micro goals (habits)
      const last30Days = microGoals.completionHistory ? this.getLast30DaysCompletions(microGoals.id, microGoals.completionHistory) : [];
      const completionRate = Math.round((last30Days.filter(day => day.completed).length / 30) * 100);
      
      return `Last 30 days completion rate: ${completionRate}%
      Recent streak: ${this.calculateCurrentStreak(microGoals.id, microGoals.completionHistory)} days
      Longest streak: ${this.calculateLongestStreak(microGoals.id, microGoals.completionHistory)} days`;
    }
  },

  calculateRemainingTime(targetDate) {
    // Implementation of calculateRemainingTime method
  },

  calculateCurrentStreak(goalId, completions) {
    // Implementation of calculateCurrentStreak method
  },

  calculateLongestStreak(goalId, completions) {
    // Implementation of calculateLongestStreak method
  },

  getLast30DaysCompletions(goalId, completions) {
    // Implementation of getLast30DaysCompletions method
  }
};

export default geminiService; 