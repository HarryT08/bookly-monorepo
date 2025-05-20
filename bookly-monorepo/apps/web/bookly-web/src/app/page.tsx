'use client';

import { useAuth } from './hooks/useAuth';
import { useState } from 'react';

export default function Index() {
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para los formularios
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');

  // Manejar inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Credenciales inválidas. Inténtelo de nuevo.');
      console.error('Error de inicio de sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register(firstName, lastName, email, password);
    } catch (err) {
      setError('Error al registrarse. Inténtelo de nuevo.');
      console.error('Error de registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookly</h1>
          <p className="text-gray-600 mb-6">Sistema de Reservas Institucionales</p>
        </div>

        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800">Bienvenido, {user.firstName} {user.lastName}</p>
              <p className="text-sm text-green-600">Has iniciado sesiu00f3n con el rol: {user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Cerrar Sesiu00f3n
            </button>
          </div>
        ) : (

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {showRegister ? (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Registro</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                  >
                    {isLoading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowRegister(false)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ¿Ya tienes una cuenta? Inicia sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Iniciar Sesión</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ¿No tienes una cuenta? Regístrate
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
