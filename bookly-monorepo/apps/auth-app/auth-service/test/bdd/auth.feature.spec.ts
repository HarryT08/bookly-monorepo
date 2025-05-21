import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/infrastructure/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

// Interfaces para tipos de DTOs usados en las pruebas
interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface User {
  id: string;
  email?: string;
}

/**
 * Pruebas de características BDD para la gestión de autenticación
 */
describe('AUTH MANAGEMENT FEATURES', () => {
  // Dependencias del servicio
  let authService: AuthService;
  let eventBus: EventBusService; // Usado para verificar la publicación de eventos
  
  /**
   * Configuración inicial para todas las pruebas
   */
  beforeAll(async () => {
    // Crear módulo de prueba con mocks para las dependencias
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id-123' }),
          },
        },
        {
          provide: EventBusService,
          useValue: {
            publish: jest.fn(),
          },
        },

        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              const configs = {
                'jwt.secret': 'test-secret',
                'jwt.expiresIn': '1h',
              };
              return configs[key];
            }),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn().mockImplementation((key) => {
              const translations = {
                'AUTH.REGISTER_SUCCESS': 'Usuario registrado exitosamente',
                'AUTH.REGISTER_FAILED': 'Error al registrar usuario',
                'AUTH.LOGIN_SUCCESS': 'Inicio de sesión exitoso',
                'AUTH.LOGIN_FAILED': 'Credenciales inválidas',
                'AUTH.LOGOUT_SUCCESS': 'Sesión cerrada exitosamente',
                'AUTH.PASSWORD_RESET_REQUEST': 'Solicitud de restablecimiento de contraseña enviada',
                'AUTH.PASSWORD_RESET_SUCCESS': 'Contraseña restablecida exitosamente',
              };
              return Promise.resolve(translations[key] || key);
            }),
          },
        },
      ],
    }).compile();

    // Obtener instancias de las dependencias
    authService = module.get<AuthService>(AuthService);
    eventBus = module.get<EventBusService>(EventBusService);
  });

  /**
   * Limpieza de mocks antes de cada prueba
   */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Característica: Registro de usuarios
   */
  describe('FEATURE: User Registration', () => {
    // Datos de prueba
    const registerUserDto: RegisterUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    /**
     * Escenario: Usuario se registra con información válida
     */
    describe('SCENARIO: User registers with valid information', () => {
      // GIVEN
      it('GIVEN a user with valid registration data', () => {
        // Validación de datos
        expect(registerUserDto).toBeDefined();
        expect(registerUserDto.email).toBeDefined();
        expect(registerUserDto.password).toBeDefined();
      });

      // WHEN
      it('WHEN the user submits registration data', async () => {
        // Ejecutar el registro
        await authService.register(registerUserDto);

        // Verificar que el evento fue publicado
        expect(eventBus.publish).toHaveBeenCalledWith('auth.registerUser', {
          userData: registerUserDto,
          requestId: expect.any(String),
        });
      });

      // THEN
      it('THEN a success message should be returned and user creation event should be published', async () => {
        // Ejecutar y verificar el registro
        const result = await authService.register(registerUserDto);
        
        // Verificar que el resultado contiene un mensaje de éxito
        expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
        
        // Verificar que el evento fue publicado
        expect(eventBus.publish).toHaveBeenCalledWith('auth.registerUser', {
          userData: registerUserDto,
          requestId: expect.any(String),
        });
      });
    });
  });

  /**
   * Característica: Autenticación de usuarios
   */
  describe('FEATURE: User Authentication', () => {
    // Datos de prueba para login
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const invalidLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    /**
     * Escenario: Usuario inicia sesión con credenciales válidas
     */
    describe('SCENARIO: User logs in with valid credentials', () => {
      // GIVEN
      it('GIVEN a user with valid credentials', () => {
        expect(loginDto.email).toBe('test@example.com');
        expect(loginDto.password).toBe('password123');
      });

      // WHEN
      it('WHEN the user submits login credentials', async () => {
        // Ejecutar el inicio de sesión
        const result = await authService.login(loginDto);
        
        // Verificar que el inicio de sesión fue procesado
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN the user should be authenticated and receive a token', async () => {
        // Ejecutar y verificar el inicio de sesión
        const result = await authService.login(loginDto);
        
        // Verificar el resultado
        expect(result).toEqual({
          message: 'Inicio de sesión exitoso',
          token: 'jwt-token-simulado',
        });
      });
    });

    /**
     * Escenario: Usuario intenta iniciar sesión con credenciales inválidas
     */
    describe('SCENARIO: User attempts to log in with invalid credentials', () => {
      // GIVEN
      it('GIVEN a user with invalid credentials', () => {
        expect(invalidLoginDto.email).toBe('test@example.com');
        expect(invalidLoginDto.password).toBe('wrongpassword');
      });

      // WHEN/THEN combinados para prueba de excepción
      it('WHEN the user submits invalid credentials THEN authentication should fail', async () => {
        // Verificar que se lanza la excepción adecuada
        await expect(authService.login(invalidLoginDto)).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  /**
   * Característica: Restablecimiento de contraseña
   */
  describe('FEATURE: Password Reset', () => {
    describe('SCENARIO: User requests password reset with valid email', () => {
      // GIVEN
      it('GIVEN a user with a valid registered email', () => {
        const validEmail = 'test@example.com';
        expect(validEmail).toBe('test@example.com');
      });

      // WHEN
      it('WHEN the user requests a password reset', async () => {
        // Ejecutar el restablecimiento de contraseña
        const result = await authService.sendPasswordReset('test@example.com');
        
        // Verificar que el restablecimiento fue procesado
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN a password reset email should be sent', async () => {
        // Ejecutar y verificar el restablecimiento de contraseña
        const result = await authService.sendPasswordReset('test@example.com');
        
        // Verificar el resultado
        expect(result).toEqual({
          message: 'Solicitud de restablecimiento de contraseña enviada',
        });
      });
    });

    describe('SCENARIO: User attempts to reset password with invalid email', () => {
      // GIVEN
      it('GIVEN a user with an unregistered email', () => {
        const invalidEmail = 'nonexistent@example.com';
        expect(invalidEmail).not.toBe('test@example.com');
      });

      // WHEN/THEN combinados para prueba de excepción
      it('WHEN the user requests a password reset with invalid email THEN it should fail', async () => {
        // Verificar que se lanza la excepción adecuada
        await expect(authService.sendPasswordReset('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      });
    });

    describe('SCENARIO: User resets password with valid token', () => {
      // GIVEN
      it('GIVEN a user with a valid reset token', () => {
        const validToken = 'valid-token';
        expect(validToken).toBe('valid-token');
      });

      // WHEN
      it('WHEN the user submits a new password with the token', async () => {
        // Ejecutar el restablecimiento de contraseña
        const result = await authService.resetPassword('valid-token', 'newpassword123');
        
        // Verificar que el restablecimiento fue procesado
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN the user\'s password should be updated', async () => {
        // Ejecutar y verificar el restablecimiento de contraseña
        const result = await authService.resetPassword('valid-token', 'newpassword123');
        
        // Verificar el resultado
        expect(result).toEqual({
          message: 'Contraseña restablecida exitosamente',
        });
      });
    });

    describe('SCENARIO: User attempts to reset password with invalid token', () => {
      // GIVEN
      it('GIVEN a user with an invalid reset token', () => {
        const invalidToken = 'invalid-token';
        expect(invalidToken).not.toBe('valid-token');
      });

      // WHEN/THEN combinados para prueba de excepción
      it('WHEN the user submits a new password with an invalid token THEN it should fail', async () => {
        // Verificar que se lanza la excepción adecuada
        await expect(authService.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  /**
   * Característica: Cierre de sesión de usuarios
   */
  describe('FEATURE: User Logout', () => {
    describe('SCENARIO: User logs out successfully', () => {
      // Datos de prueba
      const user: User = { id: 'user-id-123', email: 'test@example.com' };
      
      // GIVEN
      it('GIVEN an authenticated user', () => {
        expect(user).toBeDefined();
        expect(user.id).toBe('user-id-123');
      });

      // WHEN
      it('WHEN the user requests to log out', async () => {
        // Ejecutar el cierre de sesión
        const result = await authService.logout({ id: 'user-id-123' });
        
        // Verificar que el cierre de sesión fue procesado
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN the user should be logged out successfully', async () => {
        // Ejecutar y verificar el cierre de sesión
        const result = await authService.logout({ id: 'user-id-123' });
        
        // Verificar el resultado
        expect(result).toEqual({
          message: 'Sesión cerrada exitosamente',
        });
      });
    });
  });
});
