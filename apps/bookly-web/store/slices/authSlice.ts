/**
 * Auth slice for user authentication state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@services/auth/types';

export interface AuthState {
	user: User | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	token: null,
	refreshToken: null,
	isAuthenticated: false,
	isLoading: false,
	error: null
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loginStart: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.refreshToken = action.payload.refreshToken;
			state.isAuthenticated = true;
			state.isLoading = false;
			state.error = null;
		},
		loginFailure: (state, action: PayloadAction<string>) => {
			state.user = null;
			state.token = null;
			state.refreshToken = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.error = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.refreshToken = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.error = null;
		},
		updateUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
		},
		clearError: (state) => {
			state.error = null;
		}
	}
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions;

export default authSlice.reducer;
