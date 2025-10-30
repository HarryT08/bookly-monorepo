import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTheme } from '@/store/slices/uiSlice';
import clsx from 'clsx';

export interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  className
}) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    dispatch(setTheme(newTheme));
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        );
      case 'dark':
        return (
          <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h15.75C20.496 3 21 3.504 21 4.125V17.25A3.75 3.75 0 0117.25 21H6.75z" />
            <path d="M15 13.5a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Cambiar a modo oscuro';
      case 'dark':
        return 'Cambiar a modo sistema';
      case 'system':
      default:
        return 'Cambiar a modo claro';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        buttonSizeClasses[size],
        'rounded-lg transition-colors duration-200',
        'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100',
        'dark:text-secondary-400 dark:hover:text-secondary-100 dark:hover:bg-secondary-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'dark:focus:ring-offset-secondary-900',
        className
      )}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      {getIcon()}
    </button>
  );
};
