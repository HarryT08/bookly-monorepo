import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timeout?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: Notification[];
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  pageTitle: string;
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'system',
  language: 'es',
  notifications: [],
  loading: {
    global: false,
  },
  modals: {},
  breadcrumbs: [],
  pageTitle: 'Bookly',
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
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_theme', action.payload);
      }
    },
    setLanguage: (state, action: PayloadAction<'es' | 'en'>) => {
      state.language = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookly_language', action.payload);
      }
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    openModal: (state, action: PayloadAction<{ key: string; data?: any }>) => {
      state.modals[action.payload.key] = {
        isOpen: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
        state.modals[action.payload].data = undefined;
      }
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; href?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    initializeUI: (state) => {
      // Initialize UI state from localStorage
      if (typeof window !== 'undefined') {
        const theme = localStorage.getItem('bookly_theme');
        const language = localStorage.getItem('bookly_language');

        if (theme && ['light', 'dark', 'system'].includes(theme)) {
          state.theme = theme as 'light' | 'dark' | 'system';
        }

        if (language && ['es', 'en'].includes(language)) {
          state.language = language as 'es' | 'en';
        }
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLanguage,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setGlobalLoading,
  openModal,
  closeModal,
  setBreadcrumbs,
  setPageTitle,
  initializeUI,
} = uiSlice.actions;

export default uiSlice.reducer;
