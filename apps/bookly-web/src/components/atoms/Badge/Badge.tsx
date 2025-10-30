import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  style,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200 dark:bg-secondary-800 dark:text-secondary-300 dark:border-secondary-700',
    success: 'bg-success-100 text-success-800 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800',
    warning: 'bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800',
    error: 'bg-error-100 text-error-800 border-error-200 dark:bg-error-900/20 dark:text-error-400 dark:border-error-800',
    outline: 'bg-transparent border-secondary-300 text-secondary-700 dark:border-secondary-600 dark:text-secondary-300'
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs font-medium',
    sm: 'px-2.5 py-0.5 text-sm font-medium',
    md: 'px-3 py-1 text-sm font-medium',
    lg: 'px-4 py-1.5 text-base font-medium'
  };

  const badgeClasses = `
    inline-flex items-center rounded-full border
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span 
      className={badgeClasses}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
};
