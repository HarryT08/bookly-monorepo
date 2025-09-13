import React from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { appWithTranslation } from 'next-i18next';
import { store } from '@/store';
import { NotificationContainer } from '@/components';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <TenantProvider>
          <Component {...pageProps} />
          <NotificationContainer />
        </TenantProvider>
      </AuthProvider>
    </Provider>
  );
}

export default appWithTranslation(MyApp);
