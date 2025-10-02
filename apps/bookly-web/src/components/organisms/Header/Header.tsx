import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Logo, Button, ThemeToggle, Container, Text } from '@/components/atoms';
import { Navigation } from '@/components/molecules';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/router';

export interface HeaderProps {
  variant?: 'default' | 'minimal';
  showUserMenu?: boolean;
  showNavigation?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  showUserMenu = true,
  showNavigation = true
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  return (
    <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-200">
      <Container>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="md" variant="full" />
          </div>

          {/* Desktop Navigation */}
          {showNavigation && variant === 'default' && (
            <div className="hidden lg:block flex-1 mx-8">
              <Navigation variant="horizontal" />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Info - only show if authenticated and showUserMenu is true */}
            {isAuthenticated && user && showUserMenu && variant === 'default' && (
              <div className="hidden md:block">
                <Text variant="body2" color="secondary">
                  {t('welcome')}, <Text as="span" weight="medium" color="inherit">{user.firstName}</Text>
                </Text>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle size="md" />

            {/* Mobile menu button */}
            {showNavigation && isAuthenticated && (
              <button
                className="lg:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-white dark:hover:bg-secondary-700 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}

            {/* Auth Actions */}
            {isAuthenticated ? (
              showUserMenu && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex"
                >
                  Cerrar Sesión
                </Button>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  {t('signIn')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/auth/register')}
                  className="hidden sm:inline-flex"
                >
                  {t('signUp')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {showNavigation && isMobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden py-4 border-t border-secondary-200 dark:border-secondary-700">
            <Navigation variant="vertical" className="space-y-2" />
            {showUserMenu && (
              <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </header>
  );
};
