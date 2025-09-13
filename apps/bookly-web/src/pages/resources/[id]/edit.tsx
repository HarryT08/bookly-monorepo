import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { MainLayout, Container, LoadingSpinner } from '@/components';
import { ResourceForm } from '@/components/organisms/ResourceForm/ResourceForm';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import { resourceService } from '@/services/resources';
import type { Resource } from '@/services/resources';

const EditResourcePage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(true);
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { id } = router.query;

  useEffect(() => {
    const loadResource = async () => {
      if (!id || typeof id !== 'string') {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const resourceData = await resourceService.getResourceById(id);
        setResource(resourceData);
      } catch (error: any) {
        console.error('Error loading resource:', error);
        dispatch(addNotification({
          type: 'error',
          title: t('error'),
          message: error.message || t('resources.loadError'),
          timeout: 5000,
        }));
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadResource();
    }
  }, [id, isAuthenticated, authLoading, dispatch, t]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <MainLayout title="Editar Recurso - Bookly" showHeader={false}>
        <LoadingSpinner 
          message="Cargando..."
          size="lg"
          className="min-h-screen"
        />
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout title="Editar Recurso - Bookly">
        <Container className="py-6">
          <LoadingSpinner 
            message={t('resources.loading')}
            size="lg"
            className="py-12"
          />
        </Container>
      </MainLayout>
    );
  }

  if (notFound || !resource) {
    return (
      <MainLayout title="Recurso no encontrado - Bookly">
        <Container className="py-6">
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-secondary-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              {t('resources.notFound.title')}
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 mb-6">
              {t('resources.notFound.description')}
            </p>
            <button
              onClick={() => router.push('/resources')}
              className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('resources.backToList')}
            </button>
          </div>
        </Container>
      </MainLayout>
    );
  }

  const handleSubmit = (updatedResource: Resource) => {
    // Navigate back to resources list or resource detail
    router.push('/resources');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <MainLayout 
      title={`Editar ${resource.name} - Bookly`}
      description={`Editar recurso institucional: ${resource.name}`}
    >
      <Container className="py-6">
        <ResourceForm
          mode="edit"
          resource={resource}
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

export default EditResourcePage;
