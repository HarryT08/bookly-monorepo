import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/infrastructure/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let eventBus: EventBusService;
  let configService: ConfigService;
  let i18nService: I18nService;

  beforeEach(async () => {
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    eventBus = module.get<EventBusService>(EventBusService);
    configService = module.get<ConfigService>(ConfigService);
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and publish an event', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.register(createUserDto);

      expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
      expect(eventBus.publish).toHaveBeenCalledWith('auth.registerUser', {
        userData: createUserDto,
        requestId: expect.any(String),
      });
    });

    it('should handle registration errors', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(eventBus, 'publish').mockImplementationOnce(() => {
        throw new Error('Error publicando evento');
      });

      await expect(service.register(createUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should authenticate a user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);

      expect(result).toEqual({
        message: 'Inicio de sesión exitoso',
        token: 'jwt-token-simulado',
      });
    });

    it('should reject authentication with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const user = { id: 'user-id-123' };

      const result = await service.logout(user);

      expect(result).toEqual({
        message: 'Sesión cerrada exitosamente',
      });
    });
  });

  describe('sendPasswordReset', () => {
    it('should send a password reset email for a valid user', async () => {
      const result = await service.sendPasswordReset('test@example.com');

      expect(result).toEqual({
        message: 'Solicitud de restablecimiento de contraseña enviada',
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await expect(service.sendPasswordReset('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const result = await service.resetPassword('valid-token', 'newpassword123');

      expect(result).toEqual({
        message: 'Contraseña restablecida exitosamente',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      await expect(service.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow(UnauthorizedException);
    });
  });
});
