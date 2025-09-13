import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getUserProfile, refreshTokenThunk } from '@/store/slices/authSlice';

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (token && !user) {
        // We have a token but no user data, try to get profile
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            await dispatch(refreshTokenThunk()).unwrap();
            await dispatch(getUserProfile()).unwrap();
          } catch (refreshError) {
            // Both failed, redirect to login if auth is required
            if (requireAuth) {
              router.push('/auth/login');
            }
          }
        }
      } else if (requireAuth && !isAuthenticated && !isLoading) {
        // No authentication but required, redirect to login
        router.push('/auth/login');
      } else if (!requireAuth && isAuthenticated && router.pathname.startsWith('/auth')) {
        // Authenticated user trying to access auth pages, redirect to dashboard
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [token, user, isAuthenticated, requireAuth, router, dispatch, isLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
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
