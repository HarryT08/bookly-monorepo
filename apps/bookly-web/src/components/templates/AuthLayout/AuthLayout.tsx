import React from 'react';
import Head from 'next/head';
import clsx from 'clsx';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/atoms';

export interface AuthLayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'split' | 'centered';
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title = 'Bookly',
  description = 'Sistema de Reservas Institucionales',
  children,
  variant = 'split',
  leftContent,
  rightContent,
}) => {
  // Initialize theme system
  useTheme();
  if (variant === 'centered') {
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
          <div className="max-w-md w-full">
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex bg-white dark:bg-secondary-900 transition-colors duration-200">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        
        {/* Left Panel - Form */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-secondary-900 transition-colors duration-200">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {leftContent || children}
          </div>
        </div>

        {/* Right Panel - Welcome/Branding */}
        <div className="hidden lg:block relative flex-1">
          {rightContent}
        </div>
      </div>
    </>
  );
};
