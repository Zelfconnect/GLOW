// App-wide configuration settings
export default {
  // Maximum number of goals
  MAX_MACRO_GOALS: 3,
  MAX_MACRO_ANTI_GOALS: 3,
  MAX_MICRO_GOALS_PER_MACRO: 10,
  
  // XP Settings
  DEFAULT_XP_VALUE: 10,
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% bonus per day in streak
  MAX_STREAK_BONUS: 2.0, // Maximum 2x multiplier
  
  // Firebase Collection Names (for use with Firestore)
  COLLECTIONS: {
    USERS: 'users',
    MACRO_GOALS: 'macroGoals',
    MICRO_GOALS: 'microGoals',
    DAILY_PROGRESS: 'dailyProgress'
  },
  
  // Default templates
  TEMPLATES: {
    FITNESS: 'fitness',
    LEARNING: 'learning',
    PRODUCTIVITY: 'productivity',
    WELLNESS: 'wellness'
  }
}; 