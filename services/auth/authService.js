import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firestore/firebase';

/**
 * Service for handling authentication-related operations using Firebase Auth
 */
const authService = {
  /**
   * Register a new user with email and password
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} displayName - User's display name
   * @returns {Promise<Object>} - User credential object
   */
  async register(email, password, displayName) {
    try {
      // Create the user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      // Add display name to the user profile
      await updateProfile(userCredential.user, {
        displayName
      });
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        createdAt: serverTimestamp(),
        settings: {
          theme: 'light'
        }
      });
      
      return userCredential;
    } catch (error) {
      console.error('Error in registration:', error);
      throw error;
    }
  },
  
  /**
   * Log in an existing user with email and password
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User credential object
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      return userCredential;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   * 
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  },
  
  /**
   * Send a password reset email to the specified email address
   * 
   * @param {string} email - Email to send password reset to
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error in password reset:', error);
      throw error;
    }
  },
  
  /**
   * Get the current authenticated user
   * 
   * @returns {Object|null} - Current user or null if not authenticated
   */
  getCurrentUser() {
    return auth.currentUser;
  },
  
  /**
   * Get user data from Firestore
   * 
   * @param {string} uid - User ID
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },
  
  /**
   * Set up an observer for authentication state changes
   * 
   * @param {Function} callback - Function to call when auth state changes
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

export default authService; 