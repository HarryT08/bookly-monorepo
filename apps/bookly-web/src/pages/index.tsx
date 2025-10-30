import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { MainLayout, Text } from '@/components';
import { useAuth } from '@/hooks/useAuth';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(false);

  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <MainLayout title="Bookly - Sistema de Reservas" showHeader={false}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <Text variant="body2" color="secondary" className="mt-4">
            Cargando...
          </Text>
        </div>
      </div>
    </MainLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'es', ['common'])),
    },
  };
};

export default HomePage;
