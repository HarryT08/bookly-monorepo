import React from 'react';
import { Text } from '@/components/atoms';

export interface UserInfoFieldProps {
  label: string;
  value: string;
}

export const UserInfoField: React.FC<UserInfoFieldProps> = ({ label, value }) => {
  return (
    <div>
      <Text variant="caption" className="text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
        {label}
      </Text>
      <Text variant="body1" className="text-secondary-900 dark:text-secondary-100">
        {value}
      </Text>
    </div>
  );
};
