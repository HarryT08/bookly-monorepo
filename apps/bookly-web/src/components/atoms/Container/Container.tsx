import React from 'react';
import clsx from 'clsx';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  className,
  as: Component = 'div'
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={clsx(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
};
