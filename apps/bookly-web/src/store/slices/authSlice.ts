import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import type { LoginRequest, User as AuthUser } from '@/services/auth';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: Role[];
  permissions: Permission[];
  lastLoginAt?: string;
  profileImageUrl?: string;
}

export interface Role {
  id: string;
  categoryCode: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope?: string;
  conditions?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
};

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getUserProfile();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user profile');
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const result = await authService.refreshToken({ refreshToken });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bookly_token');
        localStorage.removeItem('bookly_refresh_token');
        localStorage.removeItem('bookly_user');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_token', action.payload.token);
        localStorage.setItem('bookly_refresh_token', action.payload.refreshToken);
      }
    },
    initializeAuth: (state) => {
      // Initialize auth state from localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('bookly_token');
        const refreshToken = localStorage.getItem('bookly_refresh_token');
        const user = localStorage.getItem('bookly_user');

        if (token && user) {
          try {
            state.token = token;
            state.refreshToken = refreshToken;
            state.user = JSON.parse(user);
            state.isAuthenticated = true;
            state.lastActivity = Date.now();
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem('bookly_token');
            localStorage.removeItem('bookly_refresh_token');
            localStorage.removeItem('bookly_user');
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.error = null;

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bookly_token', action.payload.access_token);
          if (action.payload.refreshToken) {
            localStorage.setItem('bookly_refresh_token', action.payload.refreshToken);
          }
          localStorage.setItem('bookly_user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get user profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bookly_user', JSON.stringify(action.payload));
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // If unauthorized, logout
        if (action.payload === 'Unauthorized') {
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('bookly_token');
            localStorage.removeItem('bookly_refresh_token');
            localStorage.removeItem('bookly_user');
          }
        }
      });

    // Refresh token
    builder
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bookly_token', action.payload.accessToken);
          localStorage.setItem('bookly_refresh_token', action.payload.refreshToken);
        }
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        // Force logout on refresh token failure
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bookly_token');
          localStorage.removeItem('bookly_refresh_token');
          localStorage.removeItem('bookly_user');
        }
      });
  },
});

export const { logout, clearError, updateLastActivity, setTokens, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
