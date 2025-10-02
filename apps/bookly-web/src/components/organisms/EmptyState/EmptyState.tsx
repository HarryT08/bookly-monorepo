import React from 'react';
import { Card, Text, Button } from '@/components/atoms';
import clsx from 'clsx';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  const defaultIcon = (
    <svg
      className="h-12 w-12 text-primary-600 dark:text-primary-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <Card
      variant="outlined"
      padding="xl"
      className={clsx(
        'border-dashed border-2 text-center',
        'border-secondary-300 dark:border-secondary-600',
        className
      )}
    >
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
        {icon || defaultIcon}
      </div>
      
      <Text variant="h5" className="text-secondary-900 dark:text-secondary-100 mb-2">
        {title}
      </Text>
      
      {description && (
        <Text variant="body2" color="secondary" className="mb-6">
          {description}
        </Text>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
};
