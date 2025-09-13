import React from 'react';
import { useTranslation } from 'next-i18next';
import { Logo } from '../../atoms';

export const WelcomeSection: React.FC = () => {
  const { t } = useTranslation('common');

  const avatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
    'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center p-6 lg:p-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Curved Design Elements */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 900"
          fill="none"
        >
          <path
            d="M0,300 C320,250 640,350 960,300 C1280,250 1440,300 1440,300 L1440,0 L0,0 Z"
            fill="rgba(59, 130, 246, 0.05)"
          />
          <path
            d="M0,500 C360,450 720,550 1080,500 C1320,475 1440,500 1440,500 L1440,900 L0,900 Z"
            fill="rgba(59, 130, 246, 0.03)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md text-center text-white">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Logo size="lg" variant="icon" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {t('welcome')}
            <br />
            <span className="text-gradient bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
              {t('community')}
            </span>
          </h1>
          
          <p className="text-lg text-secondary-300 leading-relaxed mb-8">
            {t('welcomeMessage')}
          </p>
        </div>

        {/* User Avatars */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex -space-x-2">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className="relative w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-secondary-700"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                  {String.fromCharCode(65 + index)}
                </div>
              </div>
            ))}
            <div className="relative w-10 h-10 rounded-full border-2 border-white/20 bg-secondary-700/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium">+</span>
            </div>
          </div>
          
          <div className="text-left">
            <p className="text-sm text-secondary-300">
              {t('joinMessage')}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Seguro</h3>
            <p className="text-xs text-secondary-400">Autenticación robusta y datos protegidos</p>
          </div>
          
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Rápido</h3>
            <p className="text-xs text-secondary-400">Reservas en tiempo real</p>
          </div>
          
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Colaborativo</h3>
            <p className="text-xs text-secondary-400">Gestión institucional integrada</p>
          </div>
          
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Intuitivo</h3>
            <p className="text-xs text-secondary-400">Interfaz fácil de usar</p>
          </div>
        </div>
      </div>
    </div>
  );
};
