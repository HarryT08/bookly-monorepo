import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { MainLayout, Container, Text, Card, Button } from '@/components';
import { LoadingSpinner, UserInfoCard } from '@/components';
import { ResourceGrid } from '@/components/organisms/ResourceGrid/ResourceGrid';
import { useAuth } from '@/hooks/useAuth';
import type { Resource } from '@/services/resources';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'resources'>('dashboard');

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

  const handleCreateResource = () => {
    router.push('/resources/new');
  };

  const handleEditResource = (resource: Resource) => {
    router.push(`/resources/${resource.id}/edit`);
  };

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
              Gestiona tus recursos y reservas desde este panel de control centralizado.
            </Text>
          </div>

          {/* Navigation Tabs */}
          <Card className="p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                <span>📊</span>
                {t('dashboard.overview')}
              </button>
              <button
                onClick={() => setActiveView('resources')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeView === 'resources'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                <span>🏢</span>
                {t('resources.title')}
              </button>
            </div>
          </Card>

          {/* Content based on active view */}
          {activeView === 'dashboard' ? (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                        {t('dashboard.stats.totalResources')}
                      </Text>
                      <Text variant="body2" color="secondary">
                        {t('dashboard.stats.resourcesSubtitle')}
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                      <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                        {t('dashboard.stats.availableToday')}
                      </Text>
                      <Text variant="body2" color="secondary">
                        {t('dashboard.stats.availableSubtitle')}
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                      <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                        {t('dashboard.stats.pendingReservations')}
                      </Text>
                      <Text variant="body2" color="secondary">
                        {t('dashboard.stats.pendingSubtitle')}
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-error-100 dark:bg-error-900/20 rounded-lg">
                      <svg className="w-6 h-6 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 13.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <Text variant="h3" className="text-secondary-900 dark:text-secondary-100">
                        {t('dashboard.stats.maintenanceNeeded')}
                      </Text>
                      <Text variant="body2" color="secondary">
                        {t('dashboard.stats.maintenanceSubtitle')}
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6">
                <Text variant="h3" className="text-secondary-900 dark:text-secondary-100 mb-4">
                  {t('dashboard.quickActions')}
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleCreateResource}
                    className="flex items-center justify-center gap-2 h-16"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('resources.createNew')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/reservations/new')}
                    className="flex items-center justify-center gap-2 h-16"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('reservations.createNew')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/reports')}
                    className="flex items-center justify-center gap-2 h-16"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t('reports.view')}
                  </Button>
                </div>
              </Card>

              {/* User Info Card */}
              <UserInfoCard user={user} />
            </div>
          ) : (
            /* Resources View */
            <ResourceGrid
              onCreateNew={handleCreateResource}
              onEditResource={handleEditResource}
              showFilters={true}
              showCreateButton={true}
            />
          )}
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
