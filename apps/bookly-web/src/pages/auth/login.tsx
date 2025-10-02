import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/store/hooks';
import { AuthLayout, LoginForm, WelcomeSection } from '@/components';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <AuthLayout
      title="Iniciar Sesión - Bookly"
      description="Accede a tu cuenta de Bookly para gestionar reservas institucionales"
      variant="split"
      leftContent={<LoginForm />}
      rightContent={<WelcomeSection />}
    />
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'es', ['common'])),
    },
  };
};

export default LoginPage;
