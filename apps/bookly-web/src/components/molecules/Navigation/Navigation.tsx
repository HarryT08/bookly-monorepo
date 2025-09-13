import React from 'react';
import { useTranslation } from 'next-i18next';
import { NavLink } from '@/components/atoms';
import { useAuth } from '@/hooks/useAuth';

export interface NavigationProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  variant = 'horizontal',
  className 
}) => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated } = useAuth(false);

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      requiresAuth: true
    },
    {
      href: '/reservas',
      label: 'Reservas',
      requiresAuth: true
    },
    {
      href: '/recursos',
      label: 'Recursos',
      requiresAuth: true
    },
    {
      href: '/reportes',
      label: 'Reportes',
      requiresAuth: true,
      roles: ['admin', 'admin_programa']
    }
  ];

  const visibleItems = navigationItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.roles && (!user?.roles || !item.roles.some(role => 
      user.roles?.some(userRole => userRole.name.toLowerCase().includes(role))
    ))) return false;
    return true;
  });

  if (!isAuthenticated || visibleItems.length === 0) {
    return null;
  }

  const containerClasses = variant === 'horizontal' 
    ? 'flex items-center space-x-1'
    : 'flex flex-col space-y-1';

  return (
    <nav className={`${containerClasses} ${className || ''}`}>
      {visibleItems.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
