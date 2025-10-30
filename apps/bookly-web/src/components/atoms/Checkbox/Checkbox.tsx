import React from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  indeterminate = false,
  className,
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const checkboxClasses = clsx(
    'h-4 w-4 text-primary-600 dark:text-primary-500 border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 rounded focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-secondary-900 transition-colors duration-200',
    error && 'border-error-500 dark:border-error-400',
    className
  );

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={checkboxRef}
          id={checkboxId}
          type="checkbox"
          className={checkboxClasses}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label htmlFor={checkboxId} className="text-secondary-700 dark:text-secondary-300 cursor-pointer">
            {label}
          </label>
          {error && (
            <p className="text-error-600 dark:text-error-400 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
