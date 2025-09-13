import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { MainLayout, Container, Text, EmptyState } from '@/components';
import { LoadingSpinner, UserInfoCard } from '@/components';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, isLoading } = useAuth(true);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <MainLayout title="Dashboard - Bookly" showHeader={false}>
        <LoadingSpinner 
          message="Cargando..."
          size="lg"
          className="min-h-screen"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`Dashboard - Bookly | ${user.firstName}`}
      description="Panel de control principal para gestión de reservas"
    >
      <Container className="py-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <Text variant="h2" className="text-secondary-900 dark:text-secondary-100">
              ¡Bienvenido de vuelta, {user.firstName}!
            </Text>
            <Text variant="body1" color="secondary">
              Aquí puedes gestionar tus reservas y acceder a todas las funcionalidades del sistema.
            </Text>
          </div>

          {/* Main Dashboard Content */}
          <EmptyState
            title="¡Dashboard funcionando correctamente!"
            description="El sistema de gestión de reservas está operativo y listo para usar. Pronto se agregarán más funcionalidades."
            className="min-h-96"
          />

          {/* User Info Card */}
          <UserInfoCard user={user} />
        </div>
      </Container>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'es', ['common'])),
    },
  };
};

export default DashboardPage;
