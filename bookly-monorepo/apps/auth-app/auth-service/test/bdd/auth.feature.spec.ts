import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/infrastructure/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AUTH MANAGEMENT FEATURES', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let eventBus: EventBusService;
  let configService: ConfigService;
  let i18nService: I18nService;
  
  beforeAll(async () => {
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
                'AUTH.LOGIN_SUCCESS': 'Inicio de sesiu00f3n exitoso',
                'AUTH.LOGIN_FAILED': 'Credenciales invu00e1lidas',
                'AUTH.LOGOUT_SUCCESS': 'Sesiu00f3n cerrada exitosamente',
                'AUTH.PASSWORD_RESET_REQUEST': 'Solicitud de restablecimiento de contraseu00f1a enviada',
                'AUTH.PASSWORD_RESET_SUCCESS': 'Contraseu00f1a restablecida exitosamente',
              };
              return Promise.resolve(translations[key] || key);
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    eventBus = module.get<EventBusService>(EventBusService);
    configService = module.get<ConfigService>(ConfigService);
    i18nService = module.get<I18nService>(I18nService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FEATURE: User Registration', () => {
    // Define test data
    const registerUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    describe('SCENARIO: User registers with valid information', () => {
      // GIVEN
      it('GIVEN a user with valid registration data', () => {
        // Validation of data would happen here
        expect(registerUserDto).toBeDefined();
        expect(registerUserDto.email).toBeDefined();
        expect(registerUserDto.password).toBeDefined();
      });

      // WHEN
      it('WHEN the user submits registration data', async () => {
        // Execute the registration
        await authService.register(registerUserDto);

        // Verify the event was published
        expect(eventBus.publish).toHaveBeenCalledWith('auth.registerUser', {
          userData: registerUserDto,
          requestId: expect.any(String),
        });
      });

      // THEN
      it('THEN a success message should be returned and user creation event should be published', async () => {
        // Execute and verify registration
        const result = await authService.register(registerUserDto);
        
        // Verify the result has a success message
        expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
        
        // Verify the event was published
        expect(eventBus.publish).toHaveBeenCalledWith('auth.registerUser', {
          userData: expect.any(Object),
          requestId: expect.any(String),
        });
      });
    });
  });

  describe('FEATURE: User Authentication', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const invalidLoginDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    describe('SCENARIO: User logs in with valid credentials', () => {
      // GIVEN
      it('GIVEN a user with valid credentials', () => {
        expect(loginDto.email).toBe('test@example.com');
        expect(loginDto.password).toBe('password123');
      });

      // WHEN
      it('WHEN the user submits login credentials', async () => {
        // Execute the login
        const result = await authService.login(loginDto);
        
        // Verify login was successful
        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
      });

      // THEN
      it('THEN the user should be authenticated and receive a token', async () => {
        // Execute and verify login
        const result = await authService.login(loginDto);
        
        // Verify the result
        expect(result).toEqual({
          message: 'Inicio de sesiu00f3n exitoso',
          token: 'jwt-token-simulado',
        });
      });
    });

    describe('SCENARIO: User attempts to log in with invalid credentials', () => {
      // GIVEN
      it('GIVEN a user with invalid credentials', () => {
        expect(invalidLoginDto.email).toBe('test@example.com');
        expect(invalidLoginDto.password).not.toBe('password123');
      });

      // WHEN/THEN combined for exception testing
      it('WHEN the user submits invalid credentials THEN authentication should fail', async () => {
        // Expect login to throw an UnauthorizedException
        await expect(authService.login(invalidLoginDto)).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('FEATURE: Password Reset', () => {
    describe('SCENARIO: User requests password reset with valid email', () => {
      // GIVEN
      it('GIVEN a user with a valid registered email', () => {
        const validEmail = 'test@example.com';
        expect(validEmail).toBe('test@example.com');
      });

      // WHEN
      it('WHEN the user requests a password reset', async () => {
        // Execute the password reset request
        const result = await authService.sendPasswordReset('test@example.com');
        
        // Verify the request was processed
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN a password reset email should be sent', async () => {
        // Execute and verify password reset request
        const result = await authService.sendPasswordReset('test@example.com');
        
        // Verify the result
        expect(result).toEqual({
          message: 'Solicitud de restablecimiento de contraseu00f1a enviada',
        });
      });
    });

    describe('SCENARIO: User attempts to reset password with invalid email', () => {
      // GIVEN
      it('GIVEN a user with an unregistered email', () => {
        const invalidEmail = 'nonexistent@example.com';
        expect(invalidEmail).not.toBe('test@example.com');
      });

      // WHEN/THEN combined for exception testing
      it('WHEN the user requests a password reset with invalid email THEN it should fail', async () => {
        // Expect password reset request to throw a NotFoundException
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
        // Execute the password reset
        const result = await authService.resetPassword('valid-token', 'newpassword123');
        
        // Verify the reset was processed
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN the user\'s password should be updated', async () => {
        // Execute and verify password reset
        const result = await authService.resetPassword('valid-token', 'newpassword123');
        
        // Verify the result
        expect(result).toEqual({
          message: 'Contraseu00f1a restablecida exitosamente',
        });
      });
    });

    describe('SCENARIO: User attempts to reset password with invalid token', () => {
      // GIVEN
      it('GIVEN a user with an invalid reset token', () => {
        const invalidToken = 'invalid-token';
        expect(invalidToken).not.toBe('valid-token');
      });

      // WHEN/THEN combined for exception testing
      it('WHEN the user submits a new password with an invalid token THEN it should fail', async () => {
        // Expect password reset to throw an UnauthorizedException
        await expect(authService.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('FEATURE: User Logout', () => {
    describe('SCENARIO: User logs out successfully', () => {
      // GIVEN
      it('GIVEN an authenticated user', () => {
        const user = { id: 'user-id-123', email: 'test@example.com' };
        expect(user).toBeDefined();
        expect(user.id).toBe('user-id-123');
      });

      // WHEN
      it('WHEN the user requests to log out', async () => {
        // Execute the logout
        const result = await authService.logout({ id: 'user-id-123' });
        
        // Verify the logout was processed
        expect(result).toBeDefined();
      });

      // THEN
      it('THEN the user should be logged out successfully', async () => {
        // Execute and verify logout
        const result = await authService.logout({ id: 'user-id-123' });
        
        // Verify the result
        expect(result).toEqual({
          message: 'Sesiu00f3n cerrada exitosamente',
        });
      });
    });
  });
});
