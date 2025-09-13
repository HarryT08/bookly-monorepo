import React from 'react';
import { useTenant } from '@/hooks/useTenant';
import { LoadingSpinner } from '@/components/atoms';

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  // Initialize tenant system but don't block the app
  const { error } = useTenant();

  // Only show error if tenant failed to load, but don't block on loading
  if (error) {
    console.error('Tenant error:', error);
    // Don't block the app, just log the error for now
  }

  return <>{children}</>;
};
