import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/infrastructure/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

// Interfaces para tipos de DTOs usados en las pruebas
interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface UserEntity {
  id: string;
}

/**
 * Pruebas unitarias para el servicio de autenticación
 */
describe('AuthService', () => {
  // Dependencias del servicio
  let service: AuthService;
  let eventBus: EventBusService; // Usado en las pruebas para verificar publicación de eventos

  /**
   * Configuración de pruebas
   */
  beforeEach(async () => {
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
    service = module.get<AuthService>(AuthService);
    eventBus = module.get<EventBusService>(EventBusService);
  });

  // Verificación básica de la instancia del servicio
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Pruebas para el método register
   */
  describe('register', () => {
    // Datos de prueba
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    
    it('should register a user and publish an event', async () => {
      // Ejecutar el método bajo prueba
      const result = await service.register(createUserDto);

      // Verificaciones
      expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
      expect(eventBus.publish).toHaveBeenCalledWith('auth.registerUser', {
        userData: createUserDto,
        requestId: expect.any(String),
      });
    });

    it('should handle registration errors', async () => {
      // Simular error durante la publicación del evento
      jest.spyOn(eventBus, 'publish').mockImplementationOnce(() => {
        throw new Error('Error publicando evento');
      });

      // Verificar que se lanza la excepción adecuada
      await expect(service.register(createUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  /**
   * Pruebas para el método login
   */
  describe('login', () => {
    // Datos de prueba
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    
    it('should authenticate a user with valid credentials', async () => {
      // Ejecutar el método bajo prueba
      const result = await service.login(loginDto);

      // Verificaciones
      expect(result).toEqual({
        message: 'Inicio de sesión exitoso',
        token: 'jwt-token-simulado',
      });
    });

    it('should reject authentication with invalid credentials', async () => {
      // Datos de prueba con credenciales inválidas
      const invalidLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Verificar que se lanza la excepción adecuada
      await expect(service.login(invalidLoginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  /**
   * Pruebas para el método logout
   */
  describe('logout', () => {
    it('should log out a user', async () => {
      // Datos de prueba
      const user: UserEntity = { id: 'user-id-123' };

      // Ejecutar el método bajo prueba
      const result = await service.logout(user);

      // Verificaciones
      expect(result).toEqual({
        message: 'Sesión cerrada exitosamente',
      });
    });
  });

  /**
   * Pruebas para el método sendPasswordReset
   */
  describe('sendPasswordReset', () => {
    it('should send a password reset email for a valid user', async () => {
      // Ejecutar el método bajo prueba
      const result = await service.sendPasswordReset('test@example.com');

      // Verificaciones
      expect(result).toEqual({
        message: 'Solicitud de restablecimiento de contraseña enviada',
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Verificar que se lanza la excepción adecuada para usuario inexistente
      await expect(service.sendPasswordReset('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pruebas para el método resetPassword
   */
  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Ejecutar el método bajo prueba
      const result = await service.resetPassword('valid-token', 'newpassword123');

      // Verificaciones
      expect(result).toEqual({
        message: 'Contraseña restablecida exitosamente',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      // Verificar que se lanza la excepción adecuada para token inválido
      await expect(service.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow(UnauthorizedException);
    });
  });
});
