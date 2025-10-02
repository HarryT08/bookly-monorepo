import React from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  as: Component = 'div'
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700',
    outlined: 'bg-transparent border-2 border-secondary-300 dark:border-secondary-600',
    elevated: 'bg-white dark:bg-secondary-800 shadow-soft-lg border border-secondary-100 dark:border-secondary-700',
    glass: 'bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <Component
      className={clsx(
        'rounded-xl transition-colors duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
};
