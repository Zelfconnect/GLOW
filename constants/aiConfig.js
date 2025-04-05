/**
 * Constants for AI-related features
 */
const aiConfig = {
  // Gemini API endpoints
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL: 'gemini-1.5-pro',  // or use 'gemini-pro' if 1.5 has issues
  
  // Configuration settings
  DEFAULT_TEMPERATURE: 0.7,  // Controls randomness (0.0-1.0)
  MAX_OUTPUT_TOKENS: 1024,   // Maximum length of response
  
  // System prompt for AI coaching
  COACH_SYSTEM_PROMPT: `You are MicroGoal's AI Coach, designed to help users achieve their goals through:
1. Providing advice and motivation tailored to their specific goals
2. Being concise but encouraging
3. Offering actionable steps they can take
4. Celebrating their progress, no matter how small
5. Helping them overcome challenges and develop better habits
6. Focusing on achievement and progress, not failure or shortcomings`,
};

export default aiConfig; 