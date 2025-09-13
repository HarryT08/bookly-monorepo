import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTokens, logout } from '@/store/slices/authSlice';
import { setAuthTokenGetter } from '@/services/http/client';

/**
 * Hook to synchronize authentication state between Redux store and HTTP client
 * This ensures that JWT tokens are always sent with API requests
 */
export const useAuthSync = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Set up the token getter function for the HTTP client
    setAuthTokenGetter(() => {
      // Always get the most current token from localStorage
      // This ensures we get the latest token even if Redux hasn't updated yet
      if (typeof window !== 'undefined') {
        return localStorage.getItem('bookly_token');
      }
      return null;
    });

    // Listen for token refresh events from the HTTP client
    const handleTokenRefresh = (event: CustomEvent) => {
      const { accessToken, refreshToken } = event.detail;
      dispatch(setTokens({ token: accessToken, refreshToken }));
    };

    // Listen for logout events from the HTTP client
    const handleLogout = () => {
      dispatch(logout());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-refreshed', handleTokenRefresh as EventListener);
      window.addEventListener('auth-logout', handleLogout);
    }

    // Cleanup event listeners
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-token-refreshed', handleTokenRefresh as EventListener);
        window.removeEventListener('auth-logout', handleLogout);
      }
    };
  }, [dispatch]);

  // Log authentication status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Auth Status: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
      if (token && isAuthenticated) {
        console.log(`🎯 JWT Token: ${token.substring(0, 20)}...`);
      }
    }
  }, [token, isAuthenticated]);

  return {
    isAuthenticated,
    token,
  };
};
