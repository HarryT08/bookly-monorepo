import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { initializeAuth, getUserProfile } from '@/store/slices/authSlice';
import { useAuthSync } from '@/hooks/useAuthSync';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitialized = useRef(false);
  
  // Initialize auth synchronization with HTTP client
  useAuthSync();

  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeAuthState = async () => {
      hasInitialized.current = true;
      
      // Initialize from localStorage first
      dispatch(initializeAuth());
      
      // Mark as initialized immediately after dispatching initializeAuth
      setIsInitialized(true);
    };

    initializeAuthState();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};
