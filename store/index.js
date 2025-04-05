import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/auth/authService';
import goalService from '../services/firestore/goalService';

// Initial state
const initialState = {
  user: null,
  macroGoals: [],
  macroAntiGoals: [],
  microGoals: [],
  todaysMicroGoals: [],
  dailyProgress: {},
  loading: false,
  error: null
};

// Create context
export const AppContext = createContext();

// Actions
export const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MACRO_GOALS: 'SET_MACRO_GOALS',
  SET_MACRO_ANTI_GOALS: 'SET_MACRO_ANTI_GOALS',
  SET_MICRO_GOALS: 'SET_MICRO_GOALS',
  SET_TODAYS_MICRO_GOALS: 'SET_TODAYS_MICRO_GOALS',
  ADD_MACRO_GOAL: 'ADD_MACRO_GOAL',
  UPDATE_MACRO_GOAL: 'UPDATE_MACRO_GOAL',
  DELETE_MACRO_GOAL: 'DELETE_MACRO_GOAL',
  ADD_MICRO_GOAL: 'ADD_MICRO_GOAL',
  UPDATE_MICRO_GOAL: 'UPDATE_MICRO_GOAL',
  DELETE_MICRO_GOAL: 'DELETE_MICRO_GOAL',
  UPDATE_GOAL_PROGRESS: 'UPDATE_GOAL_PROGRESS',
  CLEAR_STATE: 'CLEAR_STATE'
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_MACRO_GOALS:
      return { ...state, macroGoals: action.payload };
    case ACTIONS.SET_MACRO_ANTI_GOALS:
      return { ...state, macroAntiGoals: action.payload };
    case ACTIONS.SET_MICRO_GOALS:
      return { ...state, microGoals: action.payload };
    case ACTIONS.SET_TODAYS_MICRO_GOALS:
      return { ...state, todaysMicroGoals: action.payload };
    case ACTIONS.ADD_MACRO_GOAL:
      return { ...state, macroGoals: [...state.macroGoals, action.payload] };
    case ACTIONS.UPDATE_MACRO_GOAL:
      return { 
        ...state, 
        macroGoals: state.macroGoals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        )
      };
    case ACTIONS.DELETE_MACRO_GOAL:
      return { 
        ...state, 
        macroGoals: state.macroGoals.filter(goal => goal.id !== action.payload)
      };
    case ACTIONS.ADD_MICRO_GOAL:
      return { ...state, microGoals: [...state.microGoals, action.payload] };
    case ACTIONS.UPDATE_MICRO_GOAL:
      return { 
        ...state, 
        microGoals: state.microGoals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        ),
        todaysMicroGoals: state.todaysMicroGoals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        )
      };
    case ACTIONS.DELETE_MICRO_GOAL:
      return { 
        ...state, 
        microGoals: state.microGoals.filter(goal => goal.id !== action.payload),
        todaysMicroGoals: state.todaysMicroGoals.filter(goal => goal.id !== action.payload)
      };
    case ACTIONS.CLEAR_STATE:
      return initialState;
    default:
      return state;
  }
}

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch user's goals from Firestore
  const fetchUserGoals = async (userId) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      // Fetch macro goals
      const macroGoals = await goalService.getMacroGoals(userId, false);
      dispatch({ type: ACTIONS.SET_MACRO_GOALS, payload: macroGoals });

      // Fetch anti-goals (macro goals with isAntiGoal=true)
      const antiGoals = await goalService.getMacroGoals(userId, true);
      const onlyAntiGoals = antiGoals.filter(goal => goal.isAntiGoal);
      dispatch({ type: ACTIONS.SET_MACRO_ANTI_GOALS, payload: onlyAntiGoals });

      // Fetch today's micro goals
      const todaysMicroGoals = await goalService.getTodaysMicroGoals(userId);
      dispatch({ type: ACTIONS.SET_TODAYS_MICRO_GOALS, payload: todaysMicroGoals });

      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    } catch (error) {
      console.error('Error fetching user goals:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load goals data.' });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(user => {
      if (user) {
        // User is signed in, update state
        dispatch({ 
          type: ACTIONS.SET_USER, 
          payload: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          } 
        });
        
        // Fetch user's goals
        fetchUserGoals(user.uid);
      } else {
        // User is signed out, clear state
        dispatch({ type: ACTIONS.CLEAR_STATE });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext); 