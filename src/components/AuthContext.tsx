import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { subscribeToAuthChanges } from '../services/supabaseService';

/**
 * Interface for the authentication context
 */
interface AuthContextType {
  /** Current authenticated user or null if not authenticated */
  currentUser: User | null;
  /** Loading state while checking authentication */
  loading: boolean;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true
});

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 * and provides it to child components via context
 * 
 * @param children - Child components
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for storing the current authenticated user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for tracking loading state while checking authentication
  const [loading, setLoading] = useState(true);

  // Subscribe to authentication state changes when component mounts
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Unsubscribe when component unmounts
    return unsubscribe;
  }, []);

  // Context value with current user and loading state
  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the authentication context
 * 
 * @returns Authentication context with current user and loading state
 */
export const useAuth = () => {
  return useContext(AuthContext);
};