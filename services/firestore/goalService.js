import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import config from '../../constants/config';

/**
 * Service for interacting with goals in Firestore
 */
const goalService = {
  /**
   * Get all macro goals for a user
   * 
   * @param {string} userId - The user ID
   * @param {boolean} includeAntiGoals - Whether to include anti-goals
   * @returns {Promise<Array>} - Array of macro goal objects
   */
  async getMacroGoals(userId, includeAntiGoals = true) {
    try {
      console.log(`[DIAG] getMacroGoals called with userId: ${userId}`);
      
      // TEMPORARY WORKAROUND: Remove the orderBy clause to avoid requiring a compound index
      // Instead, we'll sort the results in memory after fetching them
      const goalsQuery = query(
        collection(db, config.COLLECTIONS.MACRO_GOALS),
        where('userId', '==', userId)
        // orderBy('createdAt', 'desc') - Removed to avoid index requirement
      );
      
      console.log('[DIAG] Executing Firestore query for macroGoals (without orderBy)...');
      const snapshot = await getDocs(goalsQuery);
      console.log(`[DIAG] Query returned ${snapshot.docs.length} documents`);
      
      let goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort the goals in memory by createdAt in descending order
      goals = goals.sort((a, b) => {
        // Handle potential undefined createdAt values
        if (!a.createdAt) return 1;  // Push items without createdAt to the end
        if (!b.createdAt) return -1;
        
        // Convert Firestore Timestamps to milliseconds for comparison
        const timeA = a.createdAt.toMillis ? a.createdAt.toMillis() : a.createdAt;
        const timeB = b.createdAt.toMillis ? b.createdAt.toMillis() : b.createdAt;
        
        return timeB - timeA; // Descending order (newest first)
      });
      
      console.log(`[DIAG] Processed and sorted ${goals.length} macro goals`);
      
      if (!includeAntiGoals) {
        const filteredGoals = goals.filter(goal => !goal.isAntiGoal);
        console.log(`[DIAG] Filtered out anti-goals, returning ${filteredGoals.length} goals`);
        return filteredGoals;
      }
      
      return goals;
    } catch (error) {
      console.error('Error getting macro goals:', error);
      // Log more details about the error
      console.error('[DIAG] Error details:', error.code, error.message);
      if (error.message && error.message.includes('index')) {
        console.error('[DIAG] This appears to be an indexing error. Please create the required index in Firebase Console.');
        console.error('[DIAG] Alternatively, you can modify the query to avoid using orderBy with where clauses.');
      }
      throw error;
    }
  },
  
  /**
   * Get all micro goals for a specific macro goal
   * 
   * @param {string} macroGoalId - The macro goal ID
   * @returns {Promise<Array>} - Array of micro goal objects
   */
  async getMicroGoals(macroGoalId) {
    try {
      const goalsQuery = query(
        collection(db, config.COLLECTIONS.MICRO_GOALS),
        where('macroGoalId', '==', macroGoalId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(goalsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting micro goals:', error);
      throw error;
    }
  },
  
  /**
   * Get today's micro goals for a user
   * 
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of today's micro goal objects
   */
  async getTodaysMicroGoals(userId) {
    try {
      console.log(`[DIAG] getTodaysMicroGoals called with userId: ${userId}`);
      
      // Get all micro goals for the user
      const goalsQuery = query(
        collection(db, config.COLLECTIONS.MICRO_GOALS),
        where('userId', '==', userId)
      );
      
      console.log('[DIAG] Executing Firestore query for microGoals...');
      const snapshot = await getDocs(goalsQuery);
      console.log(`[DIAG] Query returned ${snapshot.docs.length} micro goals`);
      
      const allMicroGoals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter goals that should be active today based on frequency
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      console.log(`[DIAG] Today is day ${dayOfWeek} (0=Sunday, 1=Monday, etc.)`);
      
      const filteredGoals = allMicroGoals.filter(goal => {
        // Daily goals are always active
        if (goal.frequency === 'daily') return true;
        
        // Weekday goals (Monday-Friday)
        if (goal.frequency === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
        
        // Weekend goals (Saturday-Sunday)
        if (goal.frequency === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) return true;
        
        // Custom days (e.g. ['monday', 'wednesday', 'friday'])
        if (goal.frequency === 'custom' && goal.customDays) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          return goal.customDays.includes(dayNames[dayOfWeek]);
        }
        
        return false;
      });
      
      console.log(`[DIAG] Filtered to ${filteredGoals.length} goals active for today`);
      return filteredGoals;
    } catch (error) {
      console.error('Error getting today\'s micro goals:', error);
      // Log more details about the error
      console.error('[DIAG] Error details:', error.code, error.message);
      if (error.message && error.message.includes('index')) {
        console.error('[DIAG] This appears to be an indexing error. Please create the required index in Firebase Console.');
      }
      throw error;
    }
  },
  
  /**
   * Create a new macro goal
   * 
   * @param {Object} goalData - The goal data
   * @returns {Promise<string>} - The new goal ID
   */
  async createMacroGoal(goalData) {
    try {
      const goalRef = await addDoc(collection(db, config.COLLECTIONS.MACRO_GOALS), {
        ...goalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return goalRef.id;
    } catch (error) {
      console.error('Error creating macro goal:', error);
      throw error;
    }
  },
  
  /**
   * Create a new micro goal
   * 
   * @param {Object} goalData - The goal data
   * @returns {Promise<string>} - The new goal ID
   */
  async createMicroGoal(goalData) {
    try {
      const goalRef = await addDoc(collection(db, config.COLLECTIONS.MICRO_GOALS), {
        ...goalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        streak: 0,
        lastCompleted: null,
        completionHistory: [] // Array to store completion history
      });
      
      return goalRef.id;
    } catch (error) {
      console.error('Error creating micro goal:', error);
      throw error;
    }
  },
  
  /**
   * Update a goal's completion status
   * 
   * @param {string} goalId - The goal ID to update
   * @param {boolean} completed - The new completion status
   * @returns {Promise<void>}
   */
  async updateGoalCompletion(goalId, completed) {
    try {
      const goalRef = doc(db, config.COLLECTIONS.MICRO_GOALS, goalId);
      const goalSnap = await getDoc(goalRef);
      
      if (!goalSnap.exists()) {
        throw new Error('Goal not found');
      }
      
      const goalData = goalSnap.data();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = goalData.streak || 0;
      const lastCompleted = goalData.lastCompleted ? new Date(goalData.lastCompleted.toDate()) : null;
      
      // Format date as ISO string date part only (YYYY-MM-DD)
      const todayStr = today.toISOString().split('T')[0];
      
      // Get or initialize completion history
      const completionHistory = goalData.completionHistory || [];
      
      if (completed) {
        // If completing the goal
        if (!lastCompleted) {
          // First time completing
          streak = 1;
        } else {
          lastCompleted.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastCompleted.getTime() === yesterday.getTime()) {
            // Completed yesterday, increment streak
            streak += 1;
          } else if (lastCompleted.getTime() !== today.getTime()) {
            // Wasn't completed yesterday or today, reset streak
            streak = 1;
          }
        }
        
        // Add today to completion history if not already there
        if (!completionHistory.includes(todayStr)) {
          completionHistory.push(todayStr);
        }
      } else {
        // If unmarking completion for today
        if (lastCompleted) {
          lastCompleted.setHours(0, 0, 0, 0);
          
          if (lastCompleted.getTime() === today.getTime() && streak > 0) {
            streak -= 1;
          }
        }
        
        // Remove today from completion history
        const index = completionHistory.indexOf(todayStr);
        if (index > -1) {
          completionHistory.splice(index, 1);
        }
      }
      
      await updateDoc(goalRef, {
        completed: completed,
        streak: streak,
        lastCompleted: completed ? serverTimestamp() : lastCompleted,
        completionHistory: completionHistory,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating goal completion:', error);
      throw error;
    }
  },
  
  /**
   * Check if a goal was completed on a specific date
   * 
   * @param {string} goalId - The goal ID to check
   * @param {Date} date - The date to check
   * @returns {Promise<boolean>} - Whether the goal was completed on the date
   */
  async wasCompletedOnDate(goalId, date) {
    try {
      const goalRef = doc(db, config.COLLECTIONS.MICRO_GOALS, goalId);
      const goalSnap = await getDoc(goalRef);
      
      if (!goalSnap.exists()) {
        throw new Error('Goal not found');
      }
      
      const goalData = goalSnap.data();
      const completionHistory = goalData.completionHistory || [];
      
      // Format input date as ISO string date part (YYYY-MM-DD)
      const dateStr = date.toISOString().split('T')[0];
      
      return completionHistory.includes(dateStr);
    } catch (error) {
      console.error('Error checking goal completion for date:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing macro goal
   * 
   * @param {string} goalId - The ID of the macro goal to update
   * @param {Object} goalData - The updated goal data
   * @returns {Promise<void>}
   */
  async updateMacroGoal(goalId, goalData) {
    try {
      const goalRef = doc(db, config.COLLECTIONS.MACRO_GOALS, goalId);
      
      await updateDoc(goalRef, {
        ...goalData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating macro goal:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing micro goal
   * 
   * @param {string} goalId - The ID of the micro goal to update
   * @param {Object} goalData - The updated goal data
   * @returns {Promise<void>}
   */
  async updateMicroGoal(goalId, goalData) {
    try {
      const goalRef = doc(db, config.COLLECTIONS.MICRO_GOALS, goalId);
      
      await updateDoc(goalRef, {
        ...goalData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating micro goal:', error);
      throw error;
    }
  },
  
  /**
   * Delete a macro goal and all its associated micro goals
   * 
   * @param {string} goalId - The ID of the macro goal to delete
   * @returns {Promise<void>}
   */
  async deleteMacroGoal(goalId) {
    try {
      // First, get all associated micro goals
      const microGoals = await this.getMicroGoals(goalId);
      
      // Delete all micro goals
      const deletePromises = microGoals.map(microGoal => 
        deleteDoc(doc(db, config.COLLECTIONS.MICRO_GOALS, microGoal.id))
      );
      
      // Wait for all micro goals to be deleted
      await Promise.all(deletePromises);
      
      // Delete the macro goal
      await deleteDoc(doc(db, config.COLLECTIONS.MACRO_GOALS, goalId));
    } catch (error) {
      console.error('Error deleting macro goal:', error);
      throw error;
    }
  },
  
  /**
   * Delete a micro goal
   * 
   * @param {string} macroGoalId - The ID of the parent macro goal
   * @param {string} goalId - The ID of the micro goal to delete
   * @returns {Promise<void>}
   */
  async deleteMicroGoal(macroGoalId, goalId) {
    try {
      // The macroGoalId parameter is accepted for consistency but not used in this function
      await deleteDoc(doc(db, config.COLLECTIONS.MICRO_GOALS, goalId));
    } catch (error) {
      console.error('Error deleting micro goal:', error);
      throw error;
    }
  }
};

export default goalService; 