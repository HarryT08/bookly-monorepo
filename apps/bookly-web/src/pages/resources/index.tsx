import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { MainLayout, Container } from '@/components';
import { ResourceGrid } from '@/components/organisms/ResourceGrid/ResourceGrid';
import { useAuth } from '@/hooks/useAuth';
import type { Resource } from '@/services/resources';

const ResourcesPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth(true);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <MainLayout title="Recursos - Bookly" showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  const handleCreateNew = () => {
    router.push('/resources/new');
  };

  const handleEditResource = (resource: Resource) => {
    router.push(`/resources/${resource.id}/edit`);
  };

  return (
    <MainLayout 
      title="Recursos - Bookly"
      description="Gestión de recursos institucionales - salas, laboratorios, auditorios y equipos"
    >
      <Container className="py-6">
        <ResourceGrid
          onCreateNew={handleCreateNew}
          onEditResource={handleEditResource}
          showFilters={true}
          showCreateButton={true}
        />
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

export default ResourcesPage;
