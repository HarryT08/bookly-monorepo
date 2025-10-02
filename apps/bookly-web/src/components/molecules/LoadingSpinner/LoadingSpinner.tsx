import React from 'react';
import clsx from 'clsx';
import { Spinner, Text } from '@/components/atoms';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'md',
  center = true,
  className
}) => {
  const containerClasses = center 
    ? 'flex items-center justify-center text-center'
    : 'flex items-center space-x-3';

  const spinnerSizes = {
    sm: 'sm' as const,
    md: 'lg' as const,
    lg: 'xl' as const,
  };

  return (
    <div className={clsx(containerClasses, className)}>
      {center ? (
        <div className="text-center">
          <Spinner size={spinnerSizes[size]} className="mx-auto" />
          <Text variant="body2" color="secondary" className="mt-4">
            {message}
          </Text>
        </div>
      ) : (
        <>
          <Spinner size={spinnerSizes[size]} />
          <Text variant="body2" color="secondary">
            {message}
          </Text>
        </>
      )}
    </div>
  );
};
