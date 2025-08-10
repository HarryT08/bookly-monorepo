/**
 * Settings slice for application settings state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
	direction: 'ltr' | 'rtl';
	layout: string;
	scheme: 'light' | 'dark' | 'auto';
	primaryColor: string;
	secondaryColor: string;
	navbar: {
		display: boolean;
		folded: boolean;
		position: 'left' | 'right' | 'top';
	};
	toolbar: {
		display: boolean;
		style: 'fixed' | 'static';
		position: 'above' | 'below';
	};
	footer: {
		display: boolean;
		style: 'fixed' | 'static';
		position: 'above' | 'below';
	};
}

const initialState: SettingsState = {
	direction: 'ltr',
	layout: 'layout1',
	scheme: 'auto',
	primaryColor: '#3f51b5',
	secondaryColor: '#ff4081',
	navbar: {
		display: true,
		folded: false,
		position: 'left'
	},
	toolbar: {
		display: true,
		style: 'fixed',
		position: 'above'
	},
	footer: {
		display: true,
		style: 'static',
		position: 'below'
	}
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setDirection: (state, action: PayloadAction<'ltr' | 'rtl'>) => {
			state.direction = action.payload;
		},
		setLayout: (state, action: PayloadAction<string>) => {
			state.layout = action.payload;
		},
		setScheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
			state.scheme = action.payload;
		},
		setPrimaryColor: (state, action: PayloadAction<string>) => {
			state.primaryColor = action.payload;
		},
		setSecondaryColor: (state, action: PayloadAction<string>) => {
			state.secondaryColor = action.payload;
		},
		updateNavbar: (state, action: PayloadAction<Partial<SettingsState['navbar']>>) => {
			state.navbar = { ...state.navbar, ...action.payload };
		},
		updateToolbar: (state, action: PayloadAction<Partial<SettingsState['toolbar']>>) => {
			state.toolbar = { ...state.toolbar, ...action.payload };
		},
		updateFooter: (state, action: PayloadAction<Partial<SettingsState['footer']>>) => {
			state.footer = { ...state.footer, ...action.payload };
		},
		resetSettings: () => initialState
	}
});

export const {
	setDirection,
	setLayout,
	setScheme,
	setPrimaryColor,
	setSecondaryColor,
	updateNavbar,
	updateToolbar,
	updateFooter,
	resetSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;
