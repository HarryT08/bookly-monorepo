import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  fullWidth = false,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'transition-colors duration-200 focus:outline-none focus:ring-offset-white dark:focus:ring-offset-secondary-900';
  
  const variantClasses = {
    default: 'input-field border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-400',
    filled: 'bg-secondary-100 dark:bg-secondary-700 border-transparent text-secondary-900 dark:text-secondary-100 focus:bg-white dark:focus:bg-secondary-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-400',
    outlined: 'border-2 border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:border-primary-500 dark:focus:border-primary-400',
  };

  const inputClasses = clsx(
    baseClasses,
    variantClasses[variant],
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    error && 'border-error-500 dark:border-error-400 focus:border-error-500 dark:focus:border-error-400 focus:ring-error-500 dark:focus:ring-error-400',
    fullWidth && 'w-full',
    className
  );

  return (
    <div className={clsx('relative', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 dark:text-secondary-500">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 dark:text-secondary-500">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
