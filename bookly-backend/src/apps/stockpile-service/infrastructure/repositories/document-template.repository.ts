import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { LoggingService } from '@libs/logging/logging.service';
import { DocumentTemplateRepository } from '@apps/stockpile-service/domain/repositories/document-template.repository';
import { DocumentTemplateEntity, GeneratedDocumentEntity } from '@apps/stockpile-service/domain/entities/document-template.entity';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { DocumentEventType } from '@apps/stockpile-service/utils/document-event-type.enum';

@Injectable()
export class PrismaDocumentTemplateRepository implements DocumentTemplateRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService
  ) {}
  async findDocumentTemplatesByScope(resourceType?: string, categoryId?: string, eventType?: DocumentEventType): Promise<DocumentTemplateEntity[]> {
    this.loggingService.log('Finding document templates by scope', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ resourceType, categoryId, eventType }));

    const templates = await this.prisma.documentTemplate.findMany({
      where: {
        resourceType,
        categoryId,
        eventType,
        isActive: true
      },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return templates.map(template => this.mapToDocumentTemplateEntity(template));
  }

  async findGeneratedDocumentsByReservationId(reservationId: string): Promise<GeneratedDocumentEntity[]> {
    this.loggingService.log('Finding generated documents by reservation ID', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ reservationId }));

    const documents = await this.prisma.generatedDocument.findMany({
      where: { reservationId },
      include: {
        template: true,
        reservation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return documents.map(document => this.mapToGeneratedDocumentEntity(document));
  }

  async findGeneratedDocumentsByTemplateId(templateId: string): Promise<GeneratedDocumentEntity[]> {
    this.loggingService.log('Finding generated documents by template ID', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ templateId }));

    const documents = await this.prisma.generatedDocument.findMany({
      where: { templateId },
      include: {
        template: true,
        reservation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return documents.map(document => this.mapToGeneratedDocumentEntity(document));
  }

  async deleteGeneratedDocument(id: string): Promise<void> {
    this.loggingService.log('Deleting generated document from database', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ id }));

    await this.prisma.generatedDocument.delete({
      where: { id }
    });
  }

  async createDocumentTemplate(template: DocumentTemplateEntity): Promise<DocumentTemplateEntity> {
    this.loggingService.log('Creating document template in database', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ templateId: template.id }));

    const created = await this.prisma.documentTemplate.create({
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        resourceType: template.resourceType,
        categoryId: template.categoryId,
        eventType: template.eventType,
        format: template.format,
        templatePath: template.templatePath,
        content: template.content,
        variables: template.variables,
        isDefault: template.isDefault,
        isActive: template.isActive,
        canSendAsAttachment: template.canSendAsAttachment,
        canSendAsLink: template.canSendAsLink,
        createdBy: template.createdBy,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      },
      include: {
        category: true
      }
    });

    return this.mapToDocumentTemplateEntity(created);
  }

  async updateDocumentTemplate(id: string, template: Partial<DocumentTemplateEntity>): Promise<DocumentTemplateEntity> {
    this.loggingService.log('Updating document template in database', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ templateId: template.id }));

    const updated = await this.prisma.documentTemplate.update({
      where: { id },
      data: {
        name: template.name,
        description: template.description,
        content: template.content,
        variables: template.variables,
        isActive: template.isActive,
        canSendAsAttachment: template.canSendAsAttachment,
        canSendAsLink: template.canSendAsLink,
        templatePath: template.templatePath,
        updatedAt: template.updatedAt
      },
      include: {
        category: true
      }
    });

    return this.mapToDocumentTemplateEntity(updated);
  }

  async deleteDocumentTemplate(id: string): Promise<void> {
    this.loggingService.log('Deleting document template from database', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ id }));

    await this.prisma.documentTemplate.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
  }

  async findDocumentTemplateById(id: string): Promise<DocumentTemplateEntity | null> {
    this.loggingService.log('Finding document template by ID', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ id }));

    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    return template ? this.mapToDocumentTemplateEntity(template) : null;
  }

  async findDocumentTemplates(filters: {
    resourceType?: string;
    categoryId?: string;
    eventType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ templates: DocumentTemplateEntity[]; total: number }> {
    this.loggingService.log('Finding document templates with filters', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ filters }));

    const where = {
      resourceType: filters.resourceType,
      categoryId: filters.categoryId,
      eventType: filters.eventType,
      isActive: filters.isActive
    };

    const [templates, total] = await Promise.all([
      this.prisma.documentTemplate.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
        take: filters.limit
      }),
      this.prisma.documentTemplate.count({ where })
    ]);

    return {
      templates: templates.map(template => this.mapToDocumentTemplateEntity(template)),
      total
    };
  }

  async findDefaultDocumentTemplate(resourceType?: string, categoryId?: string, eventType?: string): Promise<DocumentTemplateEntity | null> {
    this.loggingService.log('Finding default document template', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ resourceType, categoryId, eventType }));

    const template = await this.prisma.documentTemplate.findFirst({
      where: {
        resourceType,
        categoryId,
        eventType,
        isDefault: true,
        isActive: true
      },
      include: {
        category: true
      }
    });

    return template ? this.mapToDocumentTemplateEntity(template) : null;
  }

  async createGeneratedDocument(document: GeneratedDocumentEntity): Promise<GeneratedDocumentEntity> {
    this.loggingService.log('Creating generated document in database', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ documentId: document.id }));

    const created = await this.prisma.generatedDocument.create({
      data: {
        id: document.id,
        templateId: document.templateId,
        reservationId: document.reservationId,
        fileName: document.fileName,
        filePath: document.filePath,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        variables: document.variables,
        generatedBy: document.generatedBy,
        createdAt: document.createdAt
      },
      include: {
        template: true,
        reservation: true
      }
    });

    return this.mapToGeneratedDocumentEntity(created);
  }

  async findGeneratedDocumentById(id: string): Promise<GeneratedDocumentEntity | null> {
    this.loggingService.log('Finding generated document by ID', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ id }));

    const document = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        template: true,
        reservation: true
      }
    });

    return document ? this.mapToGeneratedDocumentEntity(document) : null;
  }

  async findGeneratedDocumentsByReservation(reservationId: string): Promise<GeneratedDocumentEntity[]> {
    this.loggingService.log('Finding generated documents by reservation', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ reservationId }));

    const documents = await this.prisma.generatedDocument.findMany({
      where: { reservationId },
      include: {
        template: true,
        reservation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return documents.map(document => this.mapToGeneratedDocumentEntity(document));
  }

  async findGeneratedDocumentsByTemplate(templateId: string): Promise<GeneratedDocumentEntity[]> {
    this.loggingService.log('Finding generated documents by template', 'PrismaDocumentTemplateRepository', LoggingHelper.logParams({ templateId }));

    const documents = await this.prisma.generatedDocument.findMany({
      where: { templateId },
      include: {
        template: true,
        reservation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return documents.map(document => this.mapToGeneratedDocumentEntity(document));
  }

  private mapToDocumentTemplateEntity(data: any): DocumentTemplateEntity {
    return new DocumentTemplateEntity(
      data.id,
      data.name,
      data.description,
      data.resourceType,
      data.categoryId,
      data.eventType,
      data.format,
      data.templatePath,
      data.content,
      data.variables,
      data.isDefault,
      data.isActive,
      data.canSendAsAttachment,
      data.canSendAsLink,
      data.createdBy,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToGeneratedDocumentEntity(data: any): GeneratedDocumentEntity {
    return new GeneratedDocumentEntity(
      data.id,
      data.templateId,
      data.reservationId,
      data.fileName,
      data.filePath,
      data.fileSize,
      data.mimeType,
      data.variables,
      data.generatedBy,
      data.createdAt
    );
  }
}
