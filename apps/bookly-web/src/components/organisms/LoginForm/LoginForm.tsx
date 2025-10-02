import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Button, Input, Checkbox, Logo } from '../../atoms';
import { SocialButton } from '../../molecules';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginForm: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm<LoginFormData>({
    mode: 'onChange', // Cambiar a onChange para validación en tiempo real
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Estado local para tracking manual
  const [emailValue, setEmailValue] = React.useState('');
  const [passwordValue, setPasswordValue] = React.useState('');

  // Validación simple
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const isEmailValid = emailValue.length > 0 && emailRegex.test(emailValue);
  const isPasswordValid = passwordValue.length >= 6;
  
  // Botón habilitado solo si ambos son válidos
  const shouldEnableButton = isEmailValid && isPasswordValid;


  React.useEffect(() => {
    if (error) {
      dispatch(addNotification({
        type: 'error',
        title: t('error'),
        message: error,
        timeout: 5000,
      }));
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser({
        email: data.email,
        password: data.password,
      }));

      if (loginUser.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          title: t('success'),
          message: 'Inicio de sesión exitoso',
          timeout: 3000,
        }));
        router.push('/dashboard');
      } else if (loginUser.rejected.match(result)) {
        dispatch(addNotification({
          type: 'error',
          title: t('error'),
          message: result.payload as string || 'Error en el inicio de sesión',
          timeout: 5000,
        }));
      }
    } catch (error) {
      console.log('Login error caught:', error);
      // Error is handled by the slice
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth login
    dispatch(addNotification({
      type: 'info',
      title: t('info'),
      message: 'Google SSO será implementado próximamente',
      timeout: 3000,
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo and Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo size="lg" variant="full" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t('signIn')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('noAccount')}{' '}
          <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            {t('signUp')}
          </Link>
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label={t('email') + ' *'}
          type="email"
          placeholder="admin@ufps.edu.co"
          fullWidth
          error={emailValue && !isEmailValid ? (t('validation.emailInvalid') || 'Formato de correo electrónico inválido') : undefined}
          {...register('email', {
            required: true,
            onChange: (e) => {
              setEmailValue(e.target.value);
              // Allow React Hook Form to handle the change as well
            },
          })}
        />

        <Input
          label={t('password') + ' *'}
          type="password"
          placeholder="••••••••••••"
          fullWidth
          error={passwordValue && !isPasswordValid ? (t('validation.passwordMinLength') || 'La contraseña debe tener al menos 6 caracteres') : undefined}
          {...register('password', {
            required: true,
            minLength: 6,
            onChange: (e) => {
              setPasswordValue(e.target.value);
              // Allow React Hook Form to handle the change as well
            },
          })}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label={t('rememberMe')}
            {...register('rememberMe')}
          />
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={!shouldEnableButton || isLoading}
          className="h-12"
        >
          {t('signIn')}
        </Button>
      </form>

      {/* Alternative Login Methods */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-300 dark:border-secondary-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400">
              {t('continueWith')}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <SocialButton
            provider="google"
            onClick={handleGoogleLogin}
            className="w-full"
          >
            <span className="sr-only">Google</span>
          </SocialButton>
          
          <SocialButton
            provider="github"
            onClick={() => {
              dispatch(addNotification({
                type: 'info',
                title: t('info'),
                message: 'GitHub SSO no está disponible',
                timeout: 3000,
              }));
            }}
            className="w-full"
          >
            <span className="sr-only">GitHub</span>
          </SocialButton>
          
          <SocialButton
            provider="twitter"
            onClick={() => {
              dispatch(addNotification({
                type: 'info',
                title: t('info'),
                message: 'Twitter SSO no está disponible',
                timeout: 3000,
              }));
            }}
            className="w-full"
          >
            <span className="sr-only">Twitter</span>
          </SocialButton>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="mt-8 p-4 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Estás navegando en <strong>Bookly Demo</strong>. Haz clic en el botón 
          "{t('signIn')}" para acceder al Demo y la Documentación.
        </p>
      </div>
    </div>
  );
};
