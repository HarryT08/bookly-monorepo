import React, { forwardRef } from 'react';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  fullWidth = false,
  size = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  const selectClasses = `
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    px-3 py-2
    border border-secondary-300 dark:border-secondary-600
    rounded-md
    shadow-sm
    focus:ring-primary-500 focus:border-primary-500
    dark:bg-secondary-800 dark:text-secondary-100
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
