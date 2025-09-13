import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { MainLayout, Container } from '@/components';
import { ResourceForm } from '@/components/organisms/ResourceForm/ResourceForm';
import { useAuth } from '@/hooks/useAuth';
import type { Resource } from '@/services/resources';

const NewResourcePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth(true);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <MainLayout title="Nuevo Recurso - Bookly" showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = (resource: Resource) => {
    // Navigate to resources list or resource detail
    router.push('/resources');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <MainLayout 
      title="Nuevo Recurso - Bookly"
      description="Crear un nuevo recurso institucional - salas, laboratorios, auditorios y equipos"
    >
      <Container className="py-6">
        <ResourceForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
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

export default NewResourcePage;
