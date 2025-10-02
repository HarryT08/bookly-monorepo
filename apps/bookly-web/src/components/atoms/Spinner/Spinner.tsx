import React from 'react';
import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6', 
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'border-primary-600 dark:border-primary-400',
    secondary: 'border-secondary-600 dark:border-secondary-400',
    white: 'border-white',
  };

  return (
    <div 
      className={clsx(
        'animate-spin rounded-full border-b-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};
