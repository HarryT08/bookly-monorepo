import React from 'react';
import Head from 'next/head';
import { Header } from '@/components/organisms';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  showHeader?: boolean;
  headerVariant?: 'default' | 'minimal';
  showUserMenu?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  title = 'Bookly',
  description = 'Sistema de Reservas Institucionales',
  children,
  showHeader = true,
  headerVariant = 'default',
  showUserMenu = true,
}) => {
  // Initialize theme system
  useTheme();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
        {showHeader && (
          <Header 
            variant={headerVariant} 
            showUserMenu={showUserMenu} 
          />
        )}
        
        <main className={showHeader ? 'pt-0' : ''}>
          {children}
        </main>
      </div>
    </>
  );
};
