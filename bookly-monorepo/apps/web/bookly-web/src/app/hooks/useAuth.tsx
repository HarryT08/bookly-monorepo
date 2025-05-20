/**
 * Hook personalizado para gestionar la autenticaciu00f3n
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import { User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Crear el contexto de autenticaciu00f3n
const AuthContext = createContext<AuthContextType | null>(null);

// Proveedor del contexto de autenticaciu00f3n
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Cargar el usuario al inicio
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error al cargar el usuario:', error);
        AuthService.logout(); // Limpiar tokens si hay error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Iniciar sesiu00f3n
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.login({ email, password });
      const userData = await AuthService.getProfile();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar usuario
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.register({ firstName, lastName, email, password });
      // Iniciar sesiu00f3n automau00e1ticamente despuu00e9s del registro
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cerrar sesiu00f3n
  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refrescar datos del usuario
  const refreshUser = async () => {
    if (!AuthService.isAuthenticated()) return;
    
    setIsLoading(true);
    try {
      const userData = await AuthService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error al refrescar el usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticaciu00f3n
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};
