import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LayoutSettings {
  direction: 'ltr' | 'rtl';
  navbar: {
    display: boolean;
    style: 'style-1' | 'style-2' | 'style-3';
    position: 'fixed' | 'static';
  };
  toolbar: {
    display: boolean;
    style: 'style-1' | 'style-2' | 'style-3';
    position: 'below' | 'above';
  };
  footer: {
    display: boolean;
    style: 'style-1' | 'style-2' | 'style-3';
    position: 'below' | 'above';
  };
  leftSidePanel: {
    display: boolean;
  };
  rightSidePanel: {
    display: boolean;
  };
}

export interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  warn: string;
}

export interface SettingsState {
  layout: LayoutSettings;
  customScrollbars: boolean;
  animations: boolean;
  colors: ColorSettings;
  preferences: {
    autoSave: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    timezone: string;
  };
}

const initialState: SettingsState = {
  layout: {
    direction: 'ltr',
    navbar: {
      display: true,
      style: 'style-1',
      position: 'fixed',
    },
    toolbar: {
      display: true,
      style: 'style-1',
      position: 'below',
    },
    footer: {
      display: true,
      style: 'style-1',
      position: 'below',
    },
    leftSidePanel: {
      display: false,
    },
    rightSidePanel: {
      display: false,
    },
  },
  customScrollbars: true,
  animations: true,
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    warn: '#ef4444',
  },
  preferences: {
    autoSave: true,
    notifications: {
      email: true,
      push: true,
      sound: false,
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'America/Bogota',
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateLayout: (state, action: PayloadAction<Partial<LayoutSettings>>) => {
      state.layout = { ...state.layout, ...action.payload };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_layout_settings', JSON.stringify(state.layout));
      }
    },
    updateColors: (state, action: PayloadAction<Partial<ColorSettings>>) => {
      state.colors = { ...state.colors, ...action.payload };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_color_settings', JSON.stringify(state.colors));
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<SettingsState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_preferences', JSON.stringify(state.preferences));
      }
    },
    setCustomScrollbars: (state, action: PayloadAction<boolean>) => {
      state.customScrollbars = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_custom_scrollbars', JSON.stringify(action.payload));
      }
    },
    setAnimations: (state, action: PayloadAction<boolean>) => {
      state.animations = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_animations', JSON.stringify(action.payload));
      }
    },
    resetSettings: () => {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bookly_layout_settings');
        localStorage.removeItem('bookly_color_settings');
        localStorage.removeItem('bookly_preferences');
        localStorage.removeItem('bookly_custom_scrollbars');
        localStorage.removeItem('bookly_animations');
      }
      
      return initialState;
    },
    initializeSettings: (state) => {
      // Initialize settings from localStorage
      if (typeof window !== 'undefined') {
        try {
          const layoutSettings = localStorage.getItem('bookly_layout_settings');
          const colorSettings = localStorage.getItem('bookly_color_settings');
          const preferences = localStorage.getItem('bookly_preferences');
          const customScrollbars = localStorage.getItem('bookly_custom_scrollbars');
          const animations = localStorage.getItem('bookly_animations');

          if (layoutSettings) {
            state.layout = { ...state.layout, ...JSON.parse(layoutSettings) };
          }

          if (colorSettings) {
            state.colors = { ...state.colors, ...JSON.parse(colorSettings) };
          }

          if (preferences) {
            state.preferences = { ...state.preferences, ...JSON.parse(preferences) };
          }

          if (customScrollbars !== null) {
            state.customScrollbars = JSON.parse(customScrollbars);
          }

          if (animations !== null) {
            state.animations = JSON.parse(animations);
          }
        } catch (error) {
          console.warn('Failed to load settings from localStorage:', error);
        }
      }
    },
  },
});

export const {
  updateLayout,
  updateColors,
  updatePreferences,
  setCustomScrollbars,
  setAnimations,
  resetSettings,
  initializeSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
