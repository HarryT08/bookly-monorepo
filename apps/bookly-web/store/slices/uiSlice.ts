/**
 * UI slice for application UI state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
	sidebarOpen: boolean;
	theme: 'light' | 'dark' | 'auto';
	language: string;
	loading: boolean;
	notifications: Notification[];
}

interface Notification {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
	duration?: number;
}

const initialState: UiState = {
	sidebarOpen: true,
	theme: 'auto',
	language: 'en',
	loading: false,
	notifications: []
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},
		setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
			state.theme = action.payload;
		},
		setLanguage: (state, action: PayloadAction<string>) => {
			state.language = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
			const notification: Notification = {
				...action.payload,
				id: Date.now().toString()
			};
			state.notifications.push(notification);
		},
		removeNotification: (state, action: PayloadAction<string>) => {
			state.notifications = state.notifications.filter((notification) => notification.id !== action.payload);
		},
		clearNotifications: (state) => {
			state.notifications = [];
		}
	}
});

export const {
	toggleSidebar,
	setSidebarOpen,
	setTheme,
	setLanguage,
	setLoading,
	addNotification,
	removeNotification,
	clearNotifications
} = uiSlice.actions;

export default uiSlice.reducer;
