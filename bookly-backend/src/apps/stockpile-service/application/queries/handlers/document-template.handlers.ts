import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { DocumentTemplateRepository } from '@apps/stockpile-service/domain/repositories/document-template.repository';
import {
  GetDocumentTemplatesQuery,
  GetDocumentTemplateByIdQuery,
  GetDefaultDocumentTemplateQuery,
  GetGeneratedDocumentsByReservationQuery,
  GetGeneratedDocumentByIdQuery,
  GetDocumentTemplateVariablesQuery,
  GetAvailableDocumentVariablesQuery
} from '../document-template.queries';
import { DocumentTemplateDto, GeneratedDocumentDto } from '@dto/stockpile/document-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
@QueryHandler(GetDocumentTemplatesQuery)
export class GetDocumentTemplatesHandler implements IQueryHandler<GetDocumentTemplatesQuery> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDocumentTemplatesQuery): Promise<{ templates: DocumentTemplateDto[]; total: number }> {
    this.loggingService.log('Getting document templates', 'GetDocumentTemplatesHandler', LoggingHelper.logParams({ query }));

    const result = await this.repository.findDocumentTemplates({
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      eventType: query.eventType,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit
    });

    return {
      templates: result.templates.map(template => this.mapToDto(template)),
      total: result.total
    };
  }

  private mapToDto(template: any): DocumentTemplateDto {
    return {
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
    };
  }
}

@Injectable()
@QueryHandler(GetDocumentTemplateByIdQuery)
export class GetDocumentTemplateByIdHandler implements IQueryHandler<GetDocumentTemplateByIdQuery> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDocumentTemplateByIdQuery): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Getting document template by ID', 'GetDocumentTemplateByIdHandler', LoggingHelper.logParams({ query }));

    const template = await this.repository.findDocumentTemplateById(query.id);
    
    return template ? this.mapToDto(template) : null;
  }

  private mapToDto(template: any): DocumentTemplateDto {
    return {
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
    };
  }
}

@Injectable()
@QueryHandler(GetDefaultDocumentTemplateQuery)
export class GetDefaultDocumentTemplateHandler implements IQueryHandler<GetDefaultDocumentTemplateQuery> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDefaultDocumentTemplateQuery): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Getting default document template', 'GetDefaultDocumentTemplateHandler', LoggingHelper.logParams({ query }));

    const template = await this.repository.findDefaultDocumentTemplate(
      query.resourceType,
      query.categoryId,
      query.eventType
    );
    
    return template ? this.mapToDto(template) : null;
  }

  private mapToDto(template: any): DocumentTemplateDto {
    return {
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
    };
  }
}

@Injectable()
@QueryHandler(GetGeneratedDocumentsByReservationQuery)
export class GetGeneratedDocumentsByReservationHandler implements IQueryHandler<GetGeneratedDocumentsByReservationQuery> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetGeneratedDocumentsByReservationQuery): Promise<GeneratedDocumentDto[]> {
    this.loggingService.log('Getting generated documents by reservation', 'GetGeneratedDocumentsByReservationHandler', LoggingHelper.logParams({ query }));

    const documents = await this.repository.findGeneratedDocumentsByReservation(query.reservationId);
    
    return documents.map(document => this.mapToGeneratedDocumentDto(document));
  }

  private mapToGeneratedDocumentDto(document: any): GeneratedDocumentDto {
    return {
      id: document.id,
      templateId: document.templateId,
      reservationId: document.reservationId,
      fileName: document.fileName,
      filePath: document.filePath,
      documentPath: document.filePath, // Use filePath as documentPath
      fileSize: document.fileSize,
      format: document.format || 'PDF', // Default format
      mimeType: document.mimeType,
      variables: document.variables,
      generatedBy: document.generatedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }
}

@Injectable()
@QueryHandler(GetGeneratedDocumentByIdQuery)
export class GetGeneratedDocumentByIdHandler implements IQueryHandler<GetGeneratedDocumentByIdQuery> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetGeneratedDocumentByIdQuery): Promise<GeneratedDocumentDto | null> {
    this.loggingService.log('Getting generated document by ID', 'GetGeneratedDocumentByIdHandler', LoggingHelper.logParams({ id: query.id }));

    const document = await this.repository.findGeneratedDocumentById(query.id);
    
    return document ? this.mapToGeneratedDocumentDto(document) : null;
  }

  private mapToGeneratedDocumentDto(document: any): GeneratedDocumentDto {
    return {
      id: document.id,
      templateId: document.templateId,
      reservationId: document.reservationId,
      fileName: document.fileName,
      filePath: document.filePath,
      documentPath: document.filePath, // Use filePath as documentPath
      fileSize: document.fileSize,
      format: document.format || 'PDF', // Default format
      mimeType: document.mimeType,
      variables: document.variables,
      generatedBy: document.generatedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }
}

@Injectable()
@QueryHandler(GetDocumentTemplateVariablesQuery)
export class GetDocumentTemplateVariablesHandler implements IQueryHandler<GetDocumentTemplateVariablesQuery> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDocumentTemplateVariablesQuery): Promise<any> {
    this.loggingService.log('Getting document template variables', 'GetDocumentTemplateVariablesHandler', LoggingHelper.logParams({ templateId: query.templateId }));

    const template = await this.repository.findDocumentTemplateById(query.templateId);
    
    if (!template) {
      throw new Error(`Document template with ID ${query.templateId} not found`);
    }

    return template.variables || {};
  }
}

@Injectable()
@QueryHandler(GetAvailableDocumentVariablesQuery)
export class GetAvailableDocumentVariablesHandler implements IQueryHandler<GetAvailableDocumentVariablesQuery> {
  constructor(
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetAvailableDocumentVariablesQuery): Promise<any> {
    this.loggingService.log('Getting available document variables', 'GetAvailableDocumentVariablesHandler', LoggingHelper.logParams({ query }));

    // Return available variables based on event type and resource type
    const baseVariables = {
      reservation: {
        id: 'Reservation ID',
        startTime: 'Start time',
        endTime: 'End time',
        purpose: 'Purpose',
        requesterName: 'Requester name',
        requesterEmail: 'Requester email'
      },
      resource: {
        name: 'Resource name',
        type: 'Resource type',
        location: 'Location',
        capacity: 'Capacity'
      },
      approval: {
        approverName: 'Approver name',
        approvalDate: 'Approval date',
        comments: 'Comments',
        status: 'Status'
      }
    };

    // Add resource-specific variables based on resource type
    if (query.resourceType) {
      baseVariables[`${query.resourceType}_specific`] = {
        // Add resource type specific variables here
      };
    }

    return baseVariables;
  }
}
