import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import { Text } from '../Text/Text';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Spinner size={size} />
      {message && (
        <Text 
          variant="body2" 
          color="secondary" 
          className="mt-4 text-center"
        >
          {message}
        </Text>
      )}
    </div>
  );
};
