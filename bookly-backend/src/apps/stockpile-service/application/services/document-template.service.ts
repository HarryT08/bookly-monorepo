import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import {
  CreateDocumentTemplateCommand,
  UpdateDocumentTemplateCommand,
  GenerateDocumentCommand,
  UploadDocumentTemplateCommand,
  DeleteDocumentTemplateCommand
} from '../commands/document-template.commands';
import {
  GetDocumentTemplatesQuery,
  GetDocumentTemplateByIdQuery,
  GetDefaultDocumentTemplateQuery,
  GetGeneratedDocumentsByReservationQuery,
  GetGeneratedDocumentByIdQuery,
  GetDocumentTemplateVariablesQuery,
  GetAvailableDocumentVariablesQuery
} from '../queries/document-template.queries';
import {
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  GenerateDocumentDto,
  DocumentTemplateDto,
  GeneratedDocumentDto,
  DocumentEventType
} from '@libs/dto/stockpile/document-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
export class DocumentTemplateService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService
  ) {}

  async createDocumentTemplate(dto: CreateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    this.loggingService.log('Creating document template', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const command = new CreateDocumentTemplateCommand(
      dto.name,
      dto.eventType,
      dto.format,
      dto.categoryId,
      dto.description,
      dto.resourceType,
      dto.templatePath,
      dto.content,
      dto.variables,
      dto.isDefault,
      dto.canSendAsAttachment,
      dto.canSendAsLink
    );

    return await this.commandBus.execute(command);
  }

  async updateDocumentTemplate(id: string, dto: UpdateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    this.loggingService.log('Updating document template', 'DocumentTemplateService', LoggingHelper.logParams({ id, dto }));

    const command = new UpdateDocumentTemplateCommand(
      id,
      dto.name,
      dto.description,
      dto.content,
      dto.variables,
      dto.canSendAsAttachment,
      dto.canSendAsLink,
      dto.isActive
    );

    return await this.commandBus.execute(command);
  }

  async generateDocument(dto: GenerateDocumentDto): Promise<GeneratedDocumentDto> {
    this.loggingService.log('Generating document', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const command = new GenerateDocumentCommand(
      dto.templateId,
      dto.reservationId,
      dto.variables,
      dto.generatedBy
    );

    return await this.commandBus.execute(command);
  }

  async uploadDocumentTemplate(templateId: string, file: any, uploadedBy: string): Promise<DocumentTemplateDto> {
    this.loggingService.log('Uploading document template', 'DocumentTemplateService', LoggingHelper.logParams({ templateId, fileName: file.originalname }));

    const command = new UploadDocumentTemplateCommand(templateId, file, uploadedBy);

    return await this.commandBus.execute(command);
  }

  async deleteDocumentTemplate(id: string, deletedBy: string): Promise<void> {
    this.loggingService.log('Deleting document template', 'DocumentTemplateService', LoggingHelper.logParams({ id, deletedBy }));

    const command = new DeleteDocumentTemplateCommand(id, deletedBy);

    return await this.commandBus.execute(command);
  }

  async getDocumentTemplates(
    resourceType?: string,
    categoryId?: string,
    eventType?: DocumentEventType,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<{ templates: DocumentTemplateDto[]; total: number }> {
    this.loggingService.log('Getting document templates', 'DocumentTemplateService', LoggingHelper.logParams({
      resourceType,
      categoryId,
      eventType,
      isActive,
      page,
      limit
    }));

    const query = new GetDocumentTemplatesQuery(resourceType, categoryId, eventType, isActive, page, limit);

    return await this.queryBus.execute(query);
  }

  async getDocumentTemplateById(id: string): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Getting document template by ID', 'DocumentTemplateService', LoggingHelper.logParams({ id }));

    const query = new GetDocumentTemplateByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  async getDefaultDocumentTemplate(
    resourceType?: string,
    categoryId?: string,
    eventType?: DocumentEventType
  ): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Getting default document template', 'DocumentTemplateService', LoggingHelper.logParams({
      resourceType,
      categoryId,
      eventType
    }));

    const query = new GetDefaultDocumentTemplateQuery(resourceType, categoryId, eventType);

    return await this.queryBus.execute(query);
  }

  async getGeneratedDocumentsByReservation(reservationId: string): Promise<GeneratedDocumentDto[]> {
    this.loggingService.log('Getting generated documents by reservation', 'DocumentTemplateService', LoggingHelper.logParams({ reservationId }));

    const query = new GetGeneratedDocumentsByReservationQuery(reservationId);

    return await this.queryBus.execute(query);
  }

  async getGeneratedDocumentById(id: string): Promise<GeneratedDocumentDto | null> {
    this.loggingService.log('Getting generated document by ID', 'DocumentTemplateService', LoggingHelper.logParams({ id }));

    const query = new GetGeneratedDocumentByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  async getDocumentTemplateVariables(templateId: string): Promise<any> {
    this.loggingService.log('Getting document template variables', 'DocumentTemplateService', LoggingHelper.logParams({ templateId }));

    const query = new GetDocumentTemplateVariablesQuery(templateId);

    return await this.queryBus.execute(query);
  }

  async getAvailableDocumentVariables(eventType: DocumentEventType, resourceType?: string): Promise<any> {
    this.loggingService.log('Getting available document variables', 'DocumentTemplateService', LoggingHelper.logParams({ eventType, resourceType }));

    const query = new GetAvailableDocumentVariablesQuery(eventType, resourceType);

    return await this.queryBus.execute(query);
  }
}
