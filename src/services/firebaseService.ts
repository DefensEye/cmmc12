import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { upsertUserRecord } from '../data/supabase'; // Ensure the file '../data/supabase.ts' exists or update the path

// If the file does not exist, create it at the correct path or update the import path.
import { v4 as uuidv4 } from 'uuid';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to local to keep user logged in
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with email and password
 * Stores user record in Supabase after successful authentication
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the user credentials
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user record in Supabase
    await upsertUserRecord({
      user_id: user.uid,
      user_name: user.displayName || email.split('@')[0],
      user_email: user.email || ''
    });

    return userCredential;
  } catch (error) {
    console.error('Error signing in with email and password:', error);
    throw error;
  }
};

/**
 * Create a new user with email and password
 * Stores user record in Supabase after successful creation
 * 
 * @param email - User's email address
 * @param password - User's password
 * @param displayName - Optional display name for the user
 * @returns Promise resolving to the user credentials
 */
export const createUserWithEmail = async (
  email: string, 
  password: string, 
  displayName?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user record in Supabase
    await upsertUserRecord({
      user_id: user.uid,
      user_name: displayName || email.split('@')[0],
      user_email: user.email || ''
    });

    return userCredential;
  } catch (error) {
    console.error('Error creating user with email and password:', error);
    throw error;
  }
};

/**
 * Sign in with Google
 * Stores user record in Supabase after successful authentication
 * 
 * @returns Promise resolving to the user credentials
 */
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(
      auth, 
      googleProvider, 
      browserPopupRedirectResolver
    );
    const user = userCredential.user;

    // Store user record in Supabase
    await upsertUserRecord({
      user_id: user.uid,
      user_name: user.displayName || 'Google User',
      user_email: user.email || ''
    });

    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    // Specific error handling for popup blocking
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
      }
    }
    
    throw error;
  }
};

/**
 * Sign out the current user
 * 
 * @returns Promise that resolves when sign out is complete
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 * Automatically stores user record in Supabase when auth state changes
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Store or update user record in Supabase
        await upsertUserRecord({
          user_id: user.uid,
          user_name: user.displayName || 'Unknown User',
          user_email: user.email || 'Unknown Email'
        });
      } catch (error) {
        console.error('Error storing user in Supabase:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : null,
          rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
      }
    }
    
    // Call the provided callback
    callback(user);
  });
};

/**
 * Get the current authenticated user
 * 
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

export { auth };