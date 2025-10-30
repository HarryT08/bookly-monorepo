import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DocumentTemplateService } from '@apps/stockpile-service/application/services/document-template.service';
import { DocumentTemplateRepository } from '@apps/stockpile-service/domain/repositories/document-template.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { DocumentTemplateEntity, GeneratedDocumentEntity } from '@apps/stockpile-service/domain/entities/document-template.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentEventType } from '../../utils/document-event-type.enum';
import { DocumentFormat } from '../../utils/document-format.enum';

describe('DocumentTemplateService - Document Generation BDD Tests', () => {
  let service: DocumentTemplateService;
  let documentRepository: jest.Mocked<DocumentTemplateRepository>;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTemplateService,
        {
          provide: 'DocumentTemplateRepository',
          useValue: {
            findById: jest.fn(),
            findByType: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            generateDocument: jest.fn(),
            findGeneratedDocuments: jest.fn(),
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

    service = module.get<DocumentTemplateService>(DocumentTemplateService);
    documentRepository = module.get('DocumentTemplateRepository');
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    loggingService = module.get(LoggingService);
  });

  describe('Given automatic document generation for approvals - RF-21', () => {
    const approvalData = {
      approvalFlowId: 'approval-123',
      reservationId: 'reservation-456',
      userId: 'user-789',
      resourceName: 'Auditorio Principal',
      approverName: 'Dr. Juan Pérez',
      approvalDate: new Date('2024-01-15T10:00:00Z'),
      purpose: 'Conferencia Académica',
      conditions: ['Confirmar asistencia 24h antes', 'Responsable debe estar presente'],
    };

    describe('When generating an approval letter', () => {
      beforeEach(() => {
        const approvalTemplate = new DocumentTemplateEntity(
          'template-approval',
          'Carta de Aprobación',
          'APPROVAL' as any,
          'PDF' as any,
          'user-123',
          'Plantilla para cartas de aprobación de reservas',
          undefined,
          undefined,
          undefined,
          `
          UNIVERSIDAD FRANCISCO DE PAULA SANTANDER
          CARTA DE APROBACIÓN DE RESERVA
          
          Fecha: {{approvalDate}}
          
          Por medio de la presente, {{approverName}} en calidad de {{approverRole}}, 
          APRUEBA la solicitud de reserva del recurso {{resourceName}} solicitada por {{userName}}
          para el propósito: {{purpose}}
          
          Condiciones:
          {{#each conditions}}
          - {{this}}
          {{/each}}
          
          Atentamente,
          {{approverName}}
          {{approverRole}}
          `,
          {},
          false,
          true,
          true,
          true,
          new Date(),
          new Date(),
        );
        documentRepository.findDocumentTemplatesByScope.mockResolvedValue([approvalTemplate]);
        
        const generatedDocument = new GeneratedDocumentEntity(
          'document-generated',
          'template-approval',
          approvalData.reservationId,
          'approval-123.pdf',
          '/documents/approval-123.pdf',
          'application/pdf',
          'user-123',
          new Date(),
          new Date(),
          245760,
          {}
        );
        commandBus.execute.mockResolvedValue(generatedDocument);
      });

      it('Then should generate PDF with approval details and conditions', async () => {
        // When
        const generateDto = {
          templateId: 'template-approval',
          reservationId: approvalData.reservationId,
          variables: {
            userName: approvalData.userId,
            resourceName: approvalData.resourceName,
            approverName: approvalData.approverName
          },
          generatedBy: approvalData.userId
        };
        const result = await service.generateDocument(generateDto);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'document-generated',
            templateId: 'template-approval',
            filePath: '/documents/approval-123.pdf',
            fileSize: 245760,
            format: 'pdf',
          }),
        );
        expect(commandBus.execute ).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: 'template-approval',
            reservationId: approvalData.reservationId,
            generatedBy: approvalData.userId
          }),
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'Approval document generated successfully',
          expect.stringContaining(approvalData.approvalFlowId),
        );
      });
    });

    describe('When generating a rejection letter', () => {
      const rejectionData = {
        ...approvalData,
        decision: 'rejected',
        rejectionReason: 'Conflicto con evento institucional',
        rejectionComments: 'La fecha solicitada coincide con graduación',
      };

      beforeEach(() => {
        const rejectionTemplate = new DocumentTemplateEntity(
          'template-rejection',
          'Carta de Rechazo',
          'REJECTION' as any,
          'PDF' as any,
          'user-123',
          'Carta de Rechazo de Reserva',
          undefined,
          undefined,
          undefined,
          `
          Estimado {{userName}},
          
          Su solicitud de reserva ha sido RECHAZADA.
          
          Motivo: {{rejectionReason}}
          Comentarios: {{rejectionComments}}
          
          Atentamente,
          {{approverName}}
          {{approverRole}}
          `,
          {},
          false,
          true,
          true,
          true,
          new Date(),
          new Date(),
        );
        documentRepository.findDocumentTemplatesByScope.mockResolvedValue([rejectionTemplate]);
        
        const generatedDocument = new GeneratedDocumentEntity(
          'document-rejection',
          'template-rejection',
          rejectionData.reservationId,
          'rejection-123.pdf',
          '/documents/rejection-123.pdf',
          'application/pdf',
          'user-123',
          new Date(),
          new Date(),
          245760,
          {}
        );
        commandBus.execute.mockResolvedValue(generatedDocument);
      });

      it('Then should generate PDF with rejection details and reasons', async () => {
        // When
        const generateDto = {
          templateId: 'template-rejection',
          reservationId: rejectionData.reservationId,
          variables: {
            userName: rejectionData.userId,
            rejectionReason: rejectionData.rejectionReason,
            rejectionComments: rejectionData.rejectionComments
          },
          generatedBy: rejectionData.userId
        };
        const result = await service.generateDocument(generateDto);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'document-rejection',
            templateId: 'template-rejection',
            filePath: '/documents/rejection-123.pdf',
            fileSize: 245760,
            format: 'pdf',
          }),
        );
        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: 'template-rejection',
            reservationId: rejectionData.reservationId,
            generatedBy: rejectionData.userId
          })
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'Rejection document generated successfully',
          expect.stringContaining(rejectionData.approvalFlowId),
        );
      });
    });

    describe('When template is not found', () => {
      beforeEach(() => {
        documentRepository.findDocumentTemplatesByScope.mockResolvedValue([]);
      });

      it('Then should throw NotFoundException and log the error', async () => {
        // When & Then
        await expect(service.generateDocument({
          templateId: 'template-new',
          reservationId: approvalData.reservationId,
          variables: {
            userName: approvalData.userId,
            resourceName: approvalData.resourceName,
            approverName: approvalData.approverName
          },
          generatedBy: approvalData.userId
        }))
          .rejects.toThrow(NotFoundException);

        expect(loggingService.error).toHaveBeenCalledWith(
          'Document template not found for type: approval_letter',
          expect.any(String),
        );
      });
    });

    describe('When document generation fails', () => {
      beforeEach(() => {
        const template = new DocumentTemplateEntity(
          'template-new',
          'Carta de Aprobación',
          'APPROVAL' as DocumentEventType,
          'PDF' as DocumentFormat,
          'user-123',
          'Plantilla para cartas de aprobación',
          undefined,
          undefined,
          undefined,
          'Template content',
          {},
          false,
          true,
          true,
          true,
          new Date(),
          new Date(),
        );
        documentRepository.findDocumentTemplatesByScope.mockResolvedValue([template]);
        commandBus.execute.mockRejectedValue(
          new Error('PDF generation service unavailable'),
        );
      });

      it('Then should throw BadRequestException and log the error', async () => {
        // When & Then
        await expect(service.generateDocument({
          templateId: 'template-new',
          reservationId: approvalData.reservationId,
          variables: {
            userName: approvalData.userId,
            resourceName: approvalData.resourceName,
            approverName: approvalData.approverName
          },
          generatedBy: approvalData.userId
        }))
          .rejects.toThrow(BadRequestException);

        expect(loggingService.error).toHaveBeenCalledWith(
          'Document generation failed',
          expect.stringContaining('PDF generation service unavailable'),
        );
      });
    });
  });

  describe('Given document template management', () => {
    const templateData = {
      type: 'custom_approval',
      name: 'Aprobación Personalizada',
      description: 'Template personalizado para aprobaciones especiales',
      format: 'pdf' as DocumentFormat,
      content: 'Custom template content with {{variables}}',
      isActive: true,
      eventType: 'APPROVAL' as DocumentEventType,
      variables: {},
      createdBy: 'user-123',
      resourceType: 'reservation',
      categoryId: 'category-123',
      templatePath: '/templates/approval.pdf',
      isDefault: false,
      canSendAsAttachment: true,
      canSendAsLink: true,
    };

    describe('When creating a new document template', () => {
      beforeEach(() => {
        const newTemplate = new DocumentTemplateEntity(
          'template-new',
          templateData.name,
          templateData.eventType,
          templateData.format as DocumentFormat,
          templateData.createdBy,
          templateData.description,
          templateData.resourceType,
          templateData.categoryId,
          templateData.templatePath,
          templateData.content,
          templateData.variables,
          templateData.isActive,
          templateData.canSendAsAttachment,
          templateData.canSendAsLink,
          templateData.isDefault,
          new Date(),
          new Date(),
        );
        commandBus.execute.mockResolvedValue(newTemplate);
      });

      it('Then should create the template and validate content', async () => {
        // When
        const result = await service.createDocumentTemplate(templateData as any);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'template-new',
            type: templateData.type,
            name: templateData.name,
            format: templateData.format,
            isActive: true,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Document template created successfully',
          expect.stringContaining('template-new'),
        );
      });
    });

    describe('When updating an existing template', () => {
      const templateId = 'template-existing';
      const updateData = {
        name: 'Aprobación Actualizada',
        content: 'Updated template content',
      };

      beforeEach(() => {
        const existingTemplate = new DocumentTemplateEntity(
          templateId,
          'approval_letter',
          'APPROVAL' as DocumentEventType,
          'pdf' as DocumentFormat,
          'user-123',
          'Original description',
          'reservation',
          'category-123',
          '/templates/approval.pdf',
          'Original content',
          {},
          false,
          true,
          true,
          true,
          new Date(),
          new Date(),
        );
        documentRepository.findDocumentTemplateById.mockResolvedValue(existingTemplate);
        
        const updatedTemplate = { ...existingTemplate, ...updateData };
        commandBus.execute.mockResolvedValue(updatedTemplate);
      });

      it('Then should update the template and preserve existing documents', async () => {
        // When
        const result = await service.updateDocumentTemplate(templateId, updateData);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: templateId,
            name: updateData.name,
            content: updateData.content,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Document template updated successfully',
          expect.stringContaining(templateId),
        );
      });
    });
  });

  describe('Given document retrieval and management', () => {
    const approvalFlowId = 'approval-123';

    describe('When retrieving generated documents for an approval', () => {
      beforeEach(() => {
        const generatedDocuments = [
          new GeneratedDocumentEntity(
            'doc-1',
            'template-approval',
            approvalFlowId,
            'approval-123.pdf',
            '/documents/approval-123.pdf',
            'application/pdf',
            'user-123',
            new Date('2024-01-15T10:00:00Z'),
            new Date('2024-01-15T10:00:00Z'),
            245760,
            {}
          ),
          new GeneratedDocumentEntity(
            'doc-2',
            'template-notification',
            approvalFlowId,
            'notification-123.html',
            '/documents/notification-123.html',
            'text/html',
            'user-123',
            new Date('2024-01-15T10:05:00Z'),
            new Date('2024-01-15T10:05:00Z'),
            12800,
            {}
          ),
        ];
        documentRepository.findGeneratedDocumentsByReservationId.mockResolvedValue(generatedDocuments);
      });

      it('Then should return all documents with metadata', async () => {
        // When
        const result = await service.getGeneratedDocumentsByReservation({ reservationId: approvalFlowId });

        // Then
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(
          expect.objectContaining({
            id: 'doc-1',
            format: 'pdf',
            fileSize: 245760,
          }),
        );
        expect(result[1]).toEqual(
          expect.objectContaining({
            id: 'doc-2',
            format: 'html',
            fileSize: 12800,
          }),
        );
        expect(documentRepository.findGeneratedDocumentsByReservationId).toHaveBeenCalledWith(approvalFlowId);
        expect(loggingService.log).toHaveBeenCalledWith(
          'Generated documents retrieved',
          expect.stringContaining(approvalFlowId),
        );
      });
    });

    describe('When no documents exist for an approval', () => {
      beforeEach(() => {
        documentRepository.findGeneratedDocumentsByReservationId.mockResolvedValue([]);
      });

      it('Then should return empty array and log the result', async () => {
        // When
        const result = await service.getGeneratedDocumentsByReservation({ reservationId: approvalFlowId });

        // Then
        expect(result).toHaveLength(0);
        expect(loggingService.log).toHaveBeenCalledWith(
          'No generated documents found',
          expect.stringContaining(approvalFlowId),
        );
      });
    });
  });
});
