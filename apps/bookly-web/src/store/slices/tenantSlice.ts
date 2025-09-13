import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TenantConfig, TenantColors, DEFAULT_TENANT_CONFIG } from '@/types/tenant';

interface TenantState {
  currentTenant: TenantConfig;
  colors: TenantColors | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  currentTenant: DEFAULT_TENANT_CONFIG,
  colors: null,
  isLoading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenant: (state, action: PayloadAction<TenantConfig>) => {
      state.currentTenant = action.payload;
      state.error = null;
    },
    setTenantColors: (state, action: PayloadAction<TenantColors>) => {
      state.colors = action.payload;
    },
    setTenantLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTenantError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetTenant: (state) => {
      state.currentTenant = DEFAULT_TENANT_CONFIG;
      state.colors = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setTenant,
  setTenantColors,
  setTenantLoading,
  setTenantError,
  resetTenant,
} = tenantSlice.actions;

export default tenantSlice.reducer;
