import React from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { appWithTranslation } from 'next-i18next';
import { store } from '@/store';
import { NotificationContainer } from '@/components';
import { TenantProvider } from '@/components/providers/TenantProvider';
import '@/styles/globals.css';

// Initialize store from localStorage if available
if (typeof window !== 'undefined') {
  const storedAuth = localStorage.getItem('bookly-auth');
  if (storedAuth) {
    try {
      const authData = JSON.parse(storedAuth);
      // Store will be hydrated by individual slice reducers
    } catch (error) {
      localStorage.removeItem('bookly-auth');
    }
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <TenantProvider>
        <Component {...pageProps} />
        <NotificationContainer />
      </TenantProvider>
    </Provider>
  );
}

export default appWithTranslation(MyApp);
