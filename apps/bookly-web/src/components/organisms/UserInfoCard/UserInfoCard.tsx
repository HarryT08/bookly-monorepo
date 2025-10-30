import React from 'react';
import { Card, Text } from '@/components/atoms';
import { UserInfoField } from '@/components/molecules';

export interface UserInfoCardProps {
  user: {
    email: string;
    roles?: Array<{ name: string }>;
    isEmailVerified: boolean;
    isActive: boolean;
  };
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-4">
        <Text variant="h4" className="text-secondary-900 dark:text-secondary-100">
          Información del Usuario
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserInfoField 
            label="Correo Electrónico"
            value={user.email}
          />
          <UserInfoField 
            label="Roles"
            value={user.roles?.map(r => r.name).join(', ') || 'Sin roles asignados'}
          />
          <UserInfoField 
            label="Estado de Verificación"
            value={user.isEmailVerified ? '✅ Verificado' : '⚠️ Pendiente de verificación'}
          />
          <UserInfoField 
            label="Estado de Cuenta"
            value={user.isActive ? '🟢 Activa' : '🔴 Inactiva'}
          />
        </div>
      </div>
    </Card>
  );
};
