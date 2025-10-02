import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoggingService } from '@libs/logging/logging.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterDto } from '@libs/dto';
import { SSOLoginRequestDto } from '@libs/dto/auth/auth-requests.dto';
import { RegisterCommand } from '../../application/commands/register.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService - Authentication BDD Tests', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let commandBus: jest.Mocked<CommandBus>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithRoles: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    commandBus = module.get(CommandBus);
    loggingService = module.get(LoggingService);
  });

  describe('Given a user attempting to login', () => {
    const loginDto = {
      email: 'test@ufps.edu.co',
      password: 'password123',
      ipAddress: '192.168.1.1',
    };
    let mockUser: UserEntity;

    describe('When the user provides valid credentials', () => {

      beforeEach(() => {
        mockUser = new UserEntity(
          'user-123', // id
          'test@ufps.edu.co', // email
          'test', // username
          'hashedPassword', // password
          'Test', // firstName
          'User', // lastName
          true, // isActive
          true, // isEmailVerified
          null, // emailVerificationToken
          null, // passwordResetToken
          null, // passwordResetExpires
          null, // lastLoginAt
          0, // loginAttempts
          null, // lockedUntil
          null, // ssoProvider
          null, // ssoId
          new Date(), // createdAt
          new Date(), // updatedAt
        );

        mockUser.userRoles = [
          {
            id: 'ur-1', // id
            userId: 'user-123', // userId
            roleId: 'role-student', // roleId
            assignedAt: new Date(), // assignedAt
            assignedBy: 'system', // assignedBy
            isActive: true, // isActive
            role: {
              id: 'role-student', // id
              name: 'Estudiante', // name
              description: 'Student role', // description
              isActive: true, // isActive
              isPredefined: true, // isPredefined
              category: 'academic', // category
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system',
            },
          },
        ];

        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);
        mockedBcrypt.compare.mockResolvedValue(true as never);
        jwtService.sign.mockReturnValue('jwt-token');
      });

      it('Then should return access token and log successful login', async () => {
        // Given
        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);
        mockedBcrypt.compare.mockResolvedValue(true as never);
        jwtService.sign.mockReturnValue('jwt-token');

        // When
        const validatedUser = await service.validateUser(loginDto.email, loginDto.password, loginDto.ipAddress);
        const result = await service.login(validatedUser!, loginDto.ipAddress);

        // Then
        expect(result).toEqual({
          access_token: 'jwt-token',
          user: expect.objectContaining({
            id: 'user-123',
            email: 'test@ufps.edu.co',
          }),
        });

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            sub: 'user-123',
            email: 'test@ufps.edu.co',
          }),
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'User logged in successfully',
          expect.objectContaining({
            userId: 'user-123',
            email: 'test@ufps.edu.co',
          }),
        );
      });
    });

    describe('When the user provides invalid password', () => {
      beforeEach(() => {
        mockUser = new UserEntity(
          'user-123', // id
          'test@ufps.edu.co', // email
          'test', // username
          'hashedPassword', // password
          'Test', // firstName
          'User', // lastName
          true, // isActive
          true, // isEmailVerified
          null, // emailVerificationToken
          null, // passwordResetToken
          null, // passwordResetExpires
          null, // lastLoginAt
          0, // loginAttempts
          null, // lockedUntil
          null, // ssoProvider
          null, // ssoId
          new Date(), // createdAt
          new Date(), // updatedAt
        );

        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);
        mockedBcrypt.compare.mockResolvedValue(false as never);
      });

      it('Then should return null and log failed attempt', async () => {
        // Given
        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);
        mockedBcrypt.compare.mockResolvedValue(false as never);

        // When
        const result = await service.validateUser(loginDto.email, loginDto.password, loginDto.ipAddress);

        // Then
        expect(result).toBeNull();
        expect(loggingService.warn).toHaveBeenCalledWith(
          'Failed login attempt - invalid password',
          expect.objectContaining({
            email: 'test@ufps.edu.co',
          }),
        );
      });
    });

    describe('When the user does not exist', () => {
      beforeEach(() => {
        userRepository.findByEmailWithRoles.mockResolvedValue(null);
      });

      it('Then should return null and log failed attempt', async () => {
        // Given
        userRepository.findByEmailWithRoles.mockResolvedValue(null);

        // When
        const result = await service.validateUser(loginDto.email, loginDto.password, loginDto.ipAddress);

        // Then
        expect(result).toBeNull();
        expect(loggingService.warn).toHaveBeenCalledWith(
          'Login attempt with non-existent email',
          expect.objectContaining({
            email: 'test@ufps.edu.co',
          }),
        );
      });
    });

    describe('When the user account is not verified', () => {
      beforeEach(() => {
        mockUser = new UserEntity(
            'user-123', // id
            'test@ufps.edu.co', // email
            'test', // username
            'hashedPassword', // password
            'Test', // firstName
            'User', // lastName
            true, // isActive
            false, // isEmailVerified
            null, // emailVerificationToken
            null, // passwordResetToken
            null, // passwordResetExpires
            null, // lastLoginAt
            0, // loginAttempts
            null, // lockedUntil
            null, // ssoProvider
            null, // ssoId
            new Date(), // createdAt
            new Date(), // updatedAt
          );

        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);
      });

      it('Then should throw UnauthorizedException and log verification required', async () => {
        // Given
        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);

        // When & Then
        await expect(service.validateUser(loginDto.email, loginDto.password, loginDto.ipAddress))
          .rejects.toThrow(UnauthorizedException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Login attempt with unverified email',
          expect.objectContaining({
            email: 'test@ufps.edu.co',
          }),
        );
      });
    });

    describe('When the user account is inactive', () => {
      beforeEach(() => {
        mockUser = new UserEntity(
          'user-123', // id
          'test@ufps.edu.co', // email
          'test', // username
          'hashedPassword', // password
          'Test', // firstName
          'User', // lastName
          false, // isActive
          true, // isEmailVerified
          null, // emailVerificationToken
          null, // passwordResetToken
          null, // passwordResetExpires
          null, // lastLoginAt
          0, // loginAttempts
          null, // lockedUntil
          null, // ssoProvider
          null, // ssoId
          new Date(), // createdAt
          new Date(), // updatedAt
        );

        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);
      });

      it('Then should throw UnauthorizedException and log inactive account', async () => {
        // Given
        userRepository.findByEmailWithRoles.mockResolvedValue(mockUser);

        // When & Then
        await expect(service.validateUser(loginDto.email, loginDto.password, loginDto.ipAddress))
          .rejects.toThrow(UnauthorizedException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Login attempt on inactive account',
          expect.objectContaining({
            email: 'test@ufps.edu.co',
          }),
        );
      });
    });
  });

  describe('Given a user attempting to register', () => {
    const registerDto = {
      email: 'newuser@ufps.edu.co',
      username: 'newuser',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      ipAddress: '192.168.1.1',
    };

    describe('When the email is not already registered', () => {
      beforeEach(() => {
        const mockCreatedUser = new UserEntity(
          'user-new', // id
          'newuser@ufps.edu.co', // email
          'test', // username
          'hashedPassword', // password
          'New', // firstName
          'User', // lastName
          true, // isActive
          false, // isEmailVerified - requires verification
          null, // emailVerificationToken
          null, // passwordResetToken
          null, // passwordResetExpires
          null, // lastLoginAt
          0, // loginAttempts
          null, // lockedUntil
          null, // ssoProvider
          null, // ssoId
          new Date(), // createdAt
          new Date(), // updatedAt
        );

        commandBus.execute.mockResolvedValue(mockCreatedUser);
      });

      it('Then should create user and log successful registration', async () => {
        // When
        const result = await service.register(registerDto);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            message: 'User registered successfully. Please verify your email.',
            user: expect.objectContaining({
              id: 'user-new',
              email: 'newuser@ufps.edu.co',
              firstName: 'New',
              lastName: 'User',
              username: 'test',
              isEmailVerified: false,
            }),
          }),
        );

        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.any(RegisterCommand)
        );
      });
    });

    describe('When the email is already registered', () => {
      beforeEach(() => {
        commandBus.execute.mockRejectedValue(new BadRequestException('Email already registered'));
      });

      it('Then should throw BadRequestException and log duplicate attempt', async () => {
        // When & Then
        await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);

        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.any(RegisterCommand)
        );
      });
    });
  });

  describe('Given a user attempting SSO login', () => {
    const ssoUser = {
      id: 'user-sso', // id
      email: 'sso@ufps.edu.co', // email
      firstName: 'SSO', // firstName
      lastName: 'User', // lastName
      provider: 'google', // provider
      providerId: 'google-123',
    };

    describe('When SSO user data is valid', () => {
      beforeEach(() => {
        jwtService.sign.mockReturnValue('sso-jwt-token');
      });

      it('Then should return access token and log SSO login', async () => {
        // When
        const ssoLoginRequest: SSOLoginRequestDto = {
          email: ssoUser.email,
          firstName: ssoUser.firstName,
          lastName: ssoUser.lastName,
          googleId: ssoUser.providerId,
          ssoProvider: ssoUser.provider
        };
        const result = await service.loginSSO(ssoLoginRequest);

        // Then
        expect(result).toEqual({
          access_token: 'sso-jwt-token',
          user: expect.objectContaining({
            id: 'user-sso', // id
            email: 'sso@ufps.edu.co', // email
          }),
        });

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            sub: 'user-sso', // id
            email: 'sso@ufps.edu.co', // email
            ssoProvider: 'google', // ssoProvider
            roles: [],
          }),
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'SSO login successful for user: sso@ufps.edu.co',
          'AuthService',
        );
      });
    });
  });
});
