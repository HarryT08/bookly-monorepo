import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResourceModificationGuard } from '@apps/auth-service/infrastructure/guards/resource-modification.guard';
import { UserService } from '@apps/auth-service/application/services/user.service';
import { LoggingService } from '@libs/logging/logging.service';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';

describe('ResourceModificationGuard - RF-42 BDD Tests', () => {
  let guard: ResourceModificationGuard;
  let userService: jest.Mocked<UserService>;
  let loggingService: jest.Mocked<LoggingService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceModificationGuard,
        {
          provide: UserService,
          useValue: {
            findByIdWithRoles: jest.fn(),
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
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ResourceModificationGuard>(ResourceModificationGuard);
    userService = module.get(UserService);
    loggingService = module.get(LoggingService);
    reflector = module.get(Reflector);
  });

  describe('Given a user attempting to modify resources', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        method: 'POST',
        url: '/resources/123',
        ip: '192.168.1.1',
        user: {
          id: 'user-123',
          email: 'test@ufps.edu.co',
        },
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => mockRequest,
          getResponse: () => ({}),
          getNext: () => ({}),
        }),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        getType: jest.fn(),
      } as ExecutionContext;
    });

    describe('When the user is an administrator', () => {
      beforeEach(() => {
        const mockUserWithRoles = new UserEntity(
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

        mockUserWithRoles.userRoles = [
          {
            id: 'ur-1',
            userId: 'user-123',
            roleId: 'role-admin',
            assignedAt: new Date(),
            assignedBy: 'system',
            isActive: true,
            role: {
              id: 'role-admin',
              name: 'Administrador General',
              description: 'Administrator role',
              isActive: true,
              isPredefined: true,
              category: 'administrative',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system',
            },
          },
        ];

        userService.findByIdWithRoles.mockResolvedValue(mockUserWithRoles);
      });

      it('Then should allow the modification and log the authorization', async () => {
        // When
        const result = await guard.canActivate(mockExecutionContext as ExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(userService.findByIdWithRoles).toHaveBeenCalledWith('user-123');
        expect(loggingService.log).toHaveBeenCalledWith(
          'Resource modification authorized',
          expect.stringContaining('user-123'),
        );
      });
    });

    describe('When the user is not an administrator', () => {
      beforeEach(() => {
        const mockUserWithRoles = new UserEntity(
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

        mockUserWithRoles.userRoles = [
          {
            id: 'ur-1',
            userId: 'user-123',
            roleId: 'role-student',
            assignedAt: new Date(),
            assignedBy: 'system',
            isActive: true,
            role: {
              id: 'role-student',
              name: 'Estudiante',
              description: 'Student role',
              isActive: true,
              isPredefined: true,
              category: 'academic',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system',
            },
          },
        ];

        userService.findByIdWithRoles.mockResolvedValue(mockUserWithRoles);
      });

      it('Then should deny the modification and log the attempt', async () => {
        // When & Then
        await expect(guard.canActivate(mockExecutionContext as ExecutionContext))
          .rejects.toThrow(ForbiddenException);

        expect(userService.findByIdWithRoles).toHaveBeenCalledWith('user-123');
        expect(loggingService.warn).toHaveBeenCalledWith(
          'Resource modification denied - Insufficient permissions',
          expect.any(String),
        );
      });
    });

    describe('When the user is not authenticated', () => {
      beforeEach(() => {
        mockRequest.user = null;
      });

      it('Then should deny access and log the unauthorized attempt', async () => {
        // When & Then
        await expect(guard.canActivate(mockExecutionContext as ExecutionContext))
          .rejects.toThrow(ForbiddenException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Unauthorized resource modification attempt - No authenticated user',
          expect.stringContaining('unknown'),
        );
      });
    });

    describe('When the request is a read operation', () => {
      beforeEach(() => {
        mockRequest.method = 'GET';
      });

      it('Then should allow the operation without checking roles', async () => {
        // When
        const result = await guard.canActivate(mockExecutionContext as ExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(userService.findByIdWithRoles).not.toHaveBeenCalled();
      });
    });

    describe('When there is an error retrieving user roles', () => {
      beforeEach(() => {
        userService.findByIdWithRoles.mockRejectedValue(new Error('Database error'));
      });

      it('Then should log the error and deny access', async () => {
        // When & Then
        await expect(guard.canActivate(mockExecutionContext as ExecutionContext))
          .rejects.toThrow(ForbiddenException);

        expect(loggingService.error).toHaveBeenCalledWith(
          'Error during resource modification authorization check',
          expect.stringContaining('Database error'),
        );
      });
    });
  });
});
