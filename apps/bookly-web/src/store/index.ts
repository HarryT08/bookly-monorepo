import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import settingsSlice from './slices/settingsSlice';
import tenantSlice from './slices/tenantSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    settings: settingsSlice,
    tenant: tenantSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
