import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApprovalFlowService } from '@apps/stockpile-service/application/services/approval-flow.service';
import { ApprovalFlowRepository } from '@apps/stockpile-service/domain/repositories/approval-flow.repository';
import { DocumentTemplateRepository } from '@apps/stockpile-service/domain/repositories/document-template.repository';
import { NotificationTemplateRepository } from '@apps/stockpile-service/domain/repositories/notification-template.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { ApprovalFlowEntity } from '@apps/stockpile-service/domain/entities/approval-flow.entity';
import { DocumentTemplateEntity } from '@apps/stockpile-service/domain/entities/document-template.entity';
import { NotificationTemplateEntity } from '@apps/stockpile-service/domain/entities/notification-template.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentEventType, DocumentFormat } from '@libs/dto/stockpile/document-template.dto';
import { NotificationEventType } from '@libs/dto/stockpile/notification-template.dto';

describe('ApprovalFlowService - Approval and Validation BDD Tests', () => {
  let service: ApprovalFlowService;
  let approvalRepository: jest.Mocked<ApprovalFlowRepository>;
  let documentRepository: jest.Mocked<DocumentTemplateRepository>;
  let notificationRepository: jest.Mocked<NotificationTemplateRepository>;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalFlowService,
        {
          provide: 'ApprovalFlowRepository',
          useValue: {
            findById: jest.fn(),
            findByReservationId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findPendingApprovals: jest.fn(),
            findByApprover: jest.fn(),
          },
        },
        {
          provide: 'DocumentTemplateRepository',
          useValue: {
            findByType: jest.fn(),
            generateDocument: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'NotificationTemplateRepository',
          useValue: {
            findByType: jest.fn(),
            sendNotification: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
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

    service = module.get<ApprovalFlowService>(ApprovalFlowService);
    approvalRepository = module.get('ApprovalFlowRepository');
    documentRepository = module.get('DocumentTemplateRepository');
    notificationRepository = module.get('NotificationTemplateRepository');
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    loggingService = module.get(LoggingService);
  });

  describe('Given a reservation request requiring approval - RF-20', () => {
    const reservationRequest = {
      reservationId: 'reservation-123',
      userId: 'user-456',
      resourceId: 'resource-789',
      resourceType: 'auditorium',
      requestedBy: 'user-456',
      startTime: new Date('2024-01-15T09:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      purpose: 'Conferencia académica',
      expectedAttendees: 100,
      categoryId: 'category-123',
      programId: 'program-123',
    };

    describe('When the request meets all validation criteria', () => {
      beforeEach(() => {
        const newApprovalFlow = new ApprovalFlowEntity(
          'approval-new',
          'Flujo de Aprobación Nuevo',
          reservationRequest.userId,
          'Solicitud de reserva para auditorium',
          reservationRequest.programId,
          'ROOM',
          reservationRequest.categoryId,
          false,
          true,
          false,
          24,
          2,
          true,
          new Date(),
          new Date(),
          []
        );
        commandBus.execute.mockResolvedValue(newApprovalFlow);
      });

      it('Then should create approval flow and initiate validation process', async () => {
        // When
        const result = await service.submitReservationForApproval({
          reservationId: reservationRequest.reservationId,
          userId: reservationRequest.userId,
          resourceId: reservationRequest.resourceId,
          resourceType: reservationRequest.resourceType,
          categoryId: reservationRequest.categoryId,
          programId: reservationRequest.programId
        });

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'approval-new',
            reservationId: reservationRequest.reservationId,
            status: 'pending',
            approvalLevels: expect.arrayContaining([
              expect.objectContaining({
                level: 1,
                approverRole: 'Administrador de Programa',
                status: 'pending',
              }),
            ]),
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Approval flow initiated for reservation',
          expect.stringContaining(reservationRequest.reservationId),
        );
      });
    });

    describe('When the request fails validation criteria', () => {
      const invalidRequest = {
        ...reservationRequest,
        startTime: new Date('2024-01-15T22:00:00Z'), // Outside allowed hours
        expectedAttendees: 500, // Exceeds capacity
      };

      beforeEach(() => {
        queryBus.execute.mockResolvedValue({
          isValid: false,
          violations: [
            { rule: 'timeSlot', message: 'Reservations not allowed after 20:00' },
            { rule: 'capacity', message: 'Expected attendees exceed resource capacity' },
          ],
        });
      });

      it('Then should reject the request and log validation failures', async () => {
        // When & Then
        await expect(service.submitReservationForApproval({
            reservationId: invalidRequest.reservationId,
            userId: invalidRequest.userId,
            resourceId: invalidRequest.resourceId,
            resourceType: invalidRequest.resourceType,
            categoryId: invalidRequest.categoryId,
            programId: invalidRequest.programId
          })
        )
          .rejects.toThrow(BadRequestException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Reservation approval request failed validation',
          expect.stringContaining('timeSlot'),
        );
      });
    });

    describe('When validating user permissions for resource type', () => {
      const restrictedRequest = {
        ...reservationRequest,
        resourceType: 'laboratory',
        userId: 'user-student', // Student trying to book lab
      };

      beforeEach(() => {
        queryBus.execute.mockResolvedValue({
          userType: 'estudiante',
          allowedResourceTypes: ['classroom', 'study-room'], // Lab not included
        });
      });

      it('Then should deny access and log permission violation', async () => {
        // When & Then
        await expect(service.submitReservationForApproval({
            reservationId: restrictedRequest.reservationId,
            userId: restrictedRequest.userId,
            resourceId: restrictedRequest.resourceId,
            resourceType: restrictedRequest.resourceType,
            categoryId: restrictedRequest.categoryId,
            programId: restrictedRequest.programId
          })
        )
          .rejects.toThrow(ForbiddenException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Reservation approval denied - insufficient permissions',
          expect.stringContaining('laboratory'),
        );
      });
    });
  });

  describe('Given an approver reviewing a pending request - RF-21', () => {
    const approvalId = 'approval-123';
    const approverId = 'admin-program';
    const approvalDecision = {
      decision: 'approved',
      comments: 'Solicitud aprobada para evento académico',
      conditions: ['Debe confirmar asistencia 24h antes'],
    };

    describe('When approving a valid request', () => {
      beforeEach(() => {
        const pendingApproval = new ApprovalFlowEntity(
          approvalId,
          'Flujo de Aprobación Pendiente',
          'user-789',
          'Solicitud pendiente',
          'program-123',
          'ROOM',
          'category-123',
          false,
          true,
          false,
          24,
          2,
          true,
          new Date(),
          new Date(),
          []
        );
        queryBus.execute.mockResolvedValue(pendingApproval);
        
        const approvedFlow = {
          ...pendingApproval,
          id: approvalId,
          status: 'approved'
        };
        commandBus.execute.mockResolvedValue(approvedFlow);
      });

      it('Then should approve the request and generate approval document', async () => {
        // When
        const result = await service.getApprovalFlowById(approvalId);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: approvalId,
            status: 'approved',
            approvalLevels: expect.arrayContaining([
              expect.objectContaining({
                status: 'approved',
                comments: approvalDecision.comments,
              }),
            ]),
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Approval decision processed successfully',
          expect.stringContaining(approvalId),
        );
      });
    });

    describe('When rejecting a request', () => {
      const rejectionDecision = {
        decision: 'rejected',
        comments: 'Conflicto con evento institucional programado',
        reason: 'schedule_conflict',
      };

      beforeEach(() => {
        const pendingApproval = new ApprovalFlowEntity(
          approvalId,
          'Flujo de Aprobación Pendiente',
          'user-789',
          'Solicitud pendiente',
          'program-123',
          'ROOM',
          'category-123',
          false,
          true,
          false,
          24,
          2,
          true,
          new Date(),
          new Date(),
          []
        );
        queryBus.execute.mockResolvedValue(pendingApproval);
        
        const rejectedFlow = {
          ...pendingApproval,
          status: 'rejected',
          rejectionReason: rejectionDecision.reason,
        };
        commandBus.execute.mockResolvedValue(rejectedFlow);
      });

      it('Then should reject the request and generate rejection document', async () => {
        // When
        const result = await service.getApprovalFlowById(approvalId);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: approvalId,
            status: 'rejected',
            rejectionReason: rejectionDecision.reason,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Rejection decision processed',
          expect.stringContaining(approvalId),
        );
      });
    });

    describe('When the approver is not authorized for this approval level', () => {
      const unauthorizedApproverId = 'user-unauthorized';

      beforeEach(() => {
        const pendingApproval = new ApprovalFlowEntity(
          approvalId,
          'Flujo de Aprobación Pendiente',
          'user-456',
          'Solicitud pendiente',
          'program-123',
          'ROOM',
          'category-123',
          false,
          true,
          false,
          24,
          2,
          true,
          new Date(),
          new Date(),
          []
        );
        queryBus.execute.mockResolvedValue(pendingApproval);
      });

      it('Then should deny the action and log unauthorized attempt', async () => {
        // When & Then
        await expect(service.getApprovalFlowById(approvalId))
          .rejects.toThrow(ForbiddenException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Unauthorized approval attempt',
          expect.stringContaining(unauthorizedApproverId),
        );
      });
    });
  });

  /*describe('Given automatic document generation - RF-21', () => {
    const approvalId = 'approval-123';
    const documentType = 'approval_letter';

    describe('When generating an approval document', () => {
      beforeEach(() => {
        const approvalFlow = new ApprovalFlowEntity(
          approvalId,
          'reservation-456',
          'user-789',
          'resource-auditorium',
          'approved',
          [
            {
              level: 1,
              approverId: 'admin-program',
              approverRole: 'Administrador de Programa',
              status: 'approved',
              approvedAt: new Date(),
              comments: 'Aprobado para evento académico',
            },
          ],
          'Solicitud aprobada',
          new Date(),
          new Date(),
        );
        queryBus.execute.mockResolvedValue(approvalFlow);
        
        const documentTemplate = new DocumentTemplateEntity(
          'template-approval',
          'Carta de Aprobación',
          DocumentEventType.APPROVAL,
          DocumentFormat.PDF,
          'user-789',
          'PDF template for approval letters',
          'ROOM',
          'category-123',
          '/templates/approval.pdf',
          '{{approverName}} approves {{resourceName}} for {{purpose}}',
          {},
          true,
          true,
          true,
          true,
          new Date(),
          new Date()
        );
        documentRepository.findDocumentTemplatesByScope.mockResolvedValue([documentTemplate]);
        
        commandBus.execute.mockResolvedValue({
          id: 'document-generated',
          templateId: 'template-approval',
          approvalFlowId: approvalId,
          filePath: '/documents/approval-123.pdf',
          fileSize: 245760,
          generatedAt: new Date(),
        });
      });

      it('Then should generate PDF document with approval details', async () => {
        // When
        const result = await service.getApprovalFlowById(approvalId);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'document-generated',
            filePath: '/documents/approval-123.pdf',
            fileSize: 245760,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalledWith(
          'template-approval',
          expect.objectContaining({
            approvalFlowId: approvalId,
          }),
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'Approval document generated successfully',
          expect.stringContaining(approvalId),
        );
      });
    });

    describe('When document template is not found', () => {
      beforeEach(() => {
        documentRepository.findDocumentTemplatesByScope.mockResolvedValue([]);
      });

      it('Then should throw NotFoundException and log the error', async () => {
        // When & Then
        await expect(service.getApprovalFlowById(approvalId))
          .rejects.toThrow(NotFoundException);

        expect(loggingService.error).toHaveBeenCalledWith(
          'Document template not found',
          expect.stringContaining(documentType),
        );
      });
    });
  });

  });*/

  /*describe('Given automatic notification system - RF-22', () => {
    const approvalId = 'approval-123';
    const notificationType = 'approval_decision';

    describe('When sending approval notification', () => {
      beforeEach(() => {
        const approvalFlow = new ApprovalFlowEntity(
          approvalId,
          'reservation-456',
          'user-789',
          'resource-auditorium',
          'approved',
          [
            {
              level: 1,
              approverId: 'admin-program',
              approverRole: 'Administrador de Programa',
              status: 'approved',
              approvedAt: new Date(),
              comments: 'Aprobado para evento académico',
            },
          ],
          'Solicitud aprobada',
          new Date(),
          new Date(),
        );
        queryBus.execute.mockResolvedValue(approvalFlow);
        
        const notificationTemplate = new NotificationTemplateEntity(
          'template-notification',
          'Decisión de Aprobación',
          'channel-email',
          NotificationEventType.RESERVATION_APPROVED,
          'Su solicitud ha sido {{status}}',
          'user-789',
          'ROOM',
          'category-123',
          'Notificación de Aprobación',
          {},
          true,
          true,
          false,
          false,
          new Date(),
          new Date()
        );
        queryBus.execute.mockResolvedValue([notificationTemplate]);
        
        commandBus.execute.mockResolvedValue({
          id: 'notification-sent',
          templateId: 'template-notification',
          recipientId: 'user-789',
          channels: ['email', 'whatsapp'],
          sentAt: new Date(),
          status: 'delivered',
        });
      });

      it('Then should send notification via configured channels', async () => {
        // When
        const result = await service.getApprovalFlowById(approvalId);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'notification-sent',
            recipientId: 'user-789',
            channels: ['email', 'whatsapp'],
            status: 'delivered',
          }),
        );
        expect(commandBus.execute).toHaveBeenCalledWith(
          'template-notification',
          expect.objectContaining({
            recipientId: 'user-789',
            data: expect.objectContaining({
              status: 'approved',
            }),
          }),
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'Approval notification sent successfully',
          expect.stringContaining(approvalId),
        );
      });
    });

    describe('When sending reminder notifications for pending approvals', () => {
      beforeEach(() => {
        const pendingApprovals = [
          new ApprovalFlowEntity(
            'approval-pending-1',
            'Flujo de Aprobación Pendiente',
            'user-123',
            'Solicitud pendiente hace 2 días',
            'program-123',
            'ROOM',
            'category-123',
            false,
            true,
            false,
            24,
            2,
            true,
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            new Date(),
            []
          ),
        ];
        queryBus.execute.mockResolvedValue(pendingApprovals);
        
        commandBus.execute.mockResolvedValue({
          id: 'reminder-sent',
          templateId: 'template-reminder',
          recipientId: 'admin-program',
          channels: ['email'],
          sentAt: new Date(),
          status: 'delivered',
        });
      });

      it('Then should send reminder notifications to pending approvers', async () => {
        // When
        const result = await service.getApprovalFlowById('approval-pending-1');

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            remindersSent: 1,
            notifications: expect.arrayContaining([
              expect.objectContaining({
                recipientId: 'admin-program',
                status: 'delivered',
              }),
            ]),
          }),
        );
        expect(queryBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Pending approval reminders sent',
          expect.stringContaining('remindersSent: 1'),
        );
      });
    });

    describe('When notification delivery fails', () => {
      beforeEach(() => {
        const approvalFlow = new ApprovalFlowEntity(
          approvalId,
          'Flujo de Aprobación Auditorio',
          'user-123',
          'Solicitud aprobada',
          'program-123',
          'ROOM',
          'category-123',
          false,
          true,
          false,
          24,
          2,
          true,
          new Date(),
          new Date(),
          []
        );
        queryBus.execute.mockResolvedValue(approvalFlow);
        
        queryBus.execute.mockResolvedValue([]);
        commandBus.execute.mockRejectedValue(
          new Error('WhatsApp API unavailable'),
        );
      });

      it('Then should log the failure and attempt alternative channels', async () => {
        // When & Then
        await expect(service.getApprovalFlowById(approvalId))
          .rejects.toThrow();

        expect(loggingService.error).toHaveBeenCalledWith(
          'Notification delivery failed',
          expect.stringContaining('WhatsApp API unavailable'),
        );
      });
    });
  });*/
});
