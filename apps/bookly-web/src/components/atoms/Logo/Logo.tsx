import React from 'react';
import clsx from 'clsx';
import { useTenant } from '@/hooks/useTenant';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className,
  ...props
}) => {
  const { tenant, getTenantLogo, isLoading } = useTenant();
  
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8', 
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  const logoSvg = getTenantLogo();
  
  // Show loading state if tenant is still loading
  if (isLoading) {
    return (
      <div className={clsx('flex items-center animate-pulse', sizeClasses[size], className)} {...props}>
        <div className="w-10 h-10 bg-secondary-300 dark:bg-secondary-600 rounded-lg flex-shrink-0"></div>
        {(variant === 'full' || variant === 'text') && (
          <div className="ml-2 h-6 bg-secondary-300 dark:bg-secondary-600 rounded w-16"></div>
        )}
      </div>
    );
  }
  
  const logoIcon = logoSvg ? (
    <div 
      className="flex-shrink-0"
      dangerouslySetInnerHTML={{ __html: logoSvg }}
      style={{ width: 'auto', height: '100%' }}
    />
  ) : (
    <svg
      viewBox="0 0 40 40"
      className="fill-current flex-shrink-0"
    >
      <rect x="4" y="4" width="32" height="32" rx="8" className="fill-primary-600" />
      <text
        x="20"
        y="28"
        className="fill-white text-xl font-bold"
        textAnchor="middle"
      >
        B
      </text>
    </svg>
  );

  const logoText = (
    <span className="ml-2 text-xl font-bold text-secondary-900 dark:text-white whitespace-nowrap">
      {tenant?.name || 'Bookly'}
    </span>
  );

  return (
    <div className={clsx('flex items-center', sizeClasses[size], className)} {...props}>
      {(variant === 'full' || variant === 'icon') && logoIcon}
      {(variant === 'full' || variant === 'text') && logoText}
    </div>
  );
};
