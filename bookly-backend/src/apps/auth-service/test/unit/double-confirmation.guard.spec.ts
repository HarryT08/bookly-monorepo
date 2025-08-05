import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DoubleConfirmationGuard } from '@apps/auth-service/infrastructure/guards/double-confirmation.guard';
import { LoggingService } from '@libs/logging/logging.service';

describe('DoubleConfirmationGuard - RF-42 BDD Tests', () => {
  let guard: DoubleConfirmationGuard;
  let loggingService: jest.Mocked<LoggingService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoubleConfirmationGuard,
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
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

    guard = module.get<DoubleConfirmationGuard>(DoubleConfirmationGuard);
    loggingService = module.get(LoggingService);
    reflector = module.get(Reflector);
  });

  describe('Given a user attempting to delete a resource', () => {
    let mockExecutionContext: Partial<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        method: 'DELETE',
        url: '/resources/123',
        ip: '192.168.1.1',
        params: { id: '123' },
        body: {},
        query: {},
        user: {
          id: 'user-123',
          email: 'admin@ufps.edu.co',
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => ({} as any),
          getNext: () => ({} as any),
        }),
        getHandler: () => (() => {}) as any,
        getClass: () => (() => {}) as any,
      };
    });

    describe('When the endpoint requires double confirmation', () => {
      beforeEach(() => {
        reflector.getAllAndOverride.mockReturnValue({
          required: true,
          resourceType: 'room',
          requiresDoubleConfirmation: true,
        });
      });

      describe('And the user provides correct confirmation', () => {
        beforeEach(() => {
          mockRequest.body.confirmation = 'DELETE';
        });

        it('Then should allow the deletion and log the confirmation', () => {
          // When
          const result = guard.canActivate(mockExecutionContext as ExecutionContext);

          // Then
          expect(result).toBe(true);
          expect(loggingService.log).toHaveBeenCalledWith(
            'Double confirmation validated for resource deletion',
            expect.stringContaining('room'),
          );
        });
      });

      describe('And the user provides confirmation in query params', () => {
        beforeEach(() => {
          mockRequest.query.confirmation = 'DELETE';
        });

        it('Then should allow the deletion', () => {
          // When
          const result = guard.canActivate(mockExecutionContext as ExecutionContext);

          // Then
          expect(result).toBe(true);
          expect(loggingService.log).toHaveBeenCalledWith(
            'Double confirmation validated for resource deletion',
            expect.stringContaining('room'),
          );
        });
      });

      describe('And the user provides no confirmation', () => {
        it('Then should deny the deletion and log the attempt', () => {
          // When & Then
          expect(() => guard.canActivate(mockExecutionContext as ExecutionContext))
            .toThrow(BadRequestException);

          expect(loggingService.log).toHaveBeenCalledWith(
            'Double confirmation required for resource deletion',
            expect.stringContaining('Missing confirmation field'),
          );
        });
      });

      describe('And the user provides incorrect confirmation', () => {
        beforeEach(() => {
          mockRequest.body.confirmation = 'CONFIRM';
        });

        it('Then should deny the deletion and log the invalid attempt', () => {
          // When & Then
          expect(() => guard.canActivate(mockExecutionContext as ExecutionContext))
            .toThrow(BadRequestException);

          expect(loggingService.warn).toHaveBeenCalledWith(
            'Invalid confirmation value for resource deletion',
            expect.stringContaining('Invalid confirmation value'),
          );
        });
      });
    });

    describe('When the endpoint does not require double confirmation', () => {
      beforeEach(() => {
        reflector.getAllAndOverride.mockReturnValue({
          required: true,
          resourceType: 'room',
          requiresDoubleConfirmation: false,
        });
      });

      it('Then should allow the operation without checking confirmation', () => {
        // When
        const result = guard.canActivate(mockExecutionContext as ExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(loggingService.log).not.toHaveBeenCalled();
        expect(loggingService.warn).not.toHaveBeenCalled();
      });
    });

    describe('When the request is not a DELETE operation', () => {
      beforeEach(() => {
        mockRequest.method = 'PUT';
        reflector.getAllAndOverride.mockReturnValue({
          required: true,
          resourceType: 'room',
          requiresDoubleConfirmation: true,
        });
      });

      it('Then should allow the operation without checking confirmation', () => {
        // When
        const result = guard.canActivate(mockExecutionContext as ExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(loggingService.log).not.toHaveBeenCalled();
        expect(loggingService.warn).not.toHaveBeenCalled();
      });
    });

    describe('When no resource admin metadata is present', () => {
      beforeEach(() => {
        reflector.getAllAndOverride.mockReturnValue(null);
      });

      it('Then should allow the operation', () => {
        // When
        const result = guard.canActivate(mockExecutionContext as ExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(loggingService.log).not.toHaveBeenCalled();
        expect(loggingService.warn).not.toHaveBeenCalled();
      });
    });
  });
});
