import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getUserProfile, refreshTokenThunk } from '@/store/slices/authSlice';
import { useAuthContext } from '@/components/providers/AuthProvider';

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { isInitialized } = useAuthContext();

  useEffect(() => {
    // Don't run auth check until AuthProvider has finished initialization
    if (!isInitialized) {
      console.log('[useAuth] Waiting for AuthProvider initialization...');
      return;
    }

    const checkAuth = async () => {
      console.log('[useAuth] Checking auth state:', { 
        token: !!token, 
        user: !!user, 
        isAuthenticated, 
        isLoading,
        requireAuth,
        currentPath: router.pathname
      });

      if (token && !user) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch (error) {
          try {
            await dispatch(refreshTokenThunk()).unwrap();
            await dispatch(getUserProfile()).unwrap();
          } catch (refreshError) {
            if (requireAuth) {
              router.push('/auth/login');
            }
          }
        }
      } else if (requireAuth && !isAuthenticated && !isLoading) {
        router.push('/auth/login');
      } else if (!requireAuth && isAuthenticated && router.pathname.startsWith('/auth')) {
        router.push('/dashboard');
      } else {
        console.log('[useAuth] Auth check complete, no action needed');
      }
    };

    checkAuth();
  }, [token, user, isAuthenticated, requireAuth, router, dispatch, isLoading, isInitialized]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    hasRole: (roleCode: string) => {
      return user?.roles?.some(role => role.categoryCode === roleCode) || false;
    },
    hasPermission: (resource: string, action: string) => {
      return user?.permissions?.some(
        permission => permission.resource === resource && permission.action === action
      ) || false;
    },
  };
};
