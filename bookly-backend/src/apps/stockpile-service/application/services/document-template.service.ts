import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import {
  CreateDocumentTemplateCommand,
  UpdateDocumentTemplateCommand,
  GenerateDocumentCommand,
  UploadDocumentTemplateCommand,
  DeleteDocumentTemplateCommand
} from '@apps/stockpile-service/application/commands/document-template.commands';
import {
  GetDocumentTemplatesQuery,
  GetDocumentTemplateByIdQuery,
  GetDefaultDocumentTemplateQuery,
  GetGeneratedDocumentsByReservationQuery,
  GetGeneratedDocumentByIdQuery,
  GetDocumentTemplateVariablesQuery,
  GetAvailableDocumentVariablesQuery
} from '@apps/stockpile-service/application/queries/document-template.queries';
import {
  CreateDocumentTemplateDto,
  UpdateDocumentTemplateDto,
  GenerateDocumentDto,
  UploadDocumentTemplateDto,
  DeleteDocumentTemplateDto,
  GetDocumentTemplatesDto,
  GetDefaultDocumentTemplateDto,
  DocumentTemplateDto,
  GeneratedDocumentDto,
  DocumentEventType
} from '@libs/dto/stockpile/document-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { StockpileHandlerUtil } from '../utils/stockpile-handler.util';

@Injectable()
export class DocumentTemplateService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService
  ) {}

  async createDocumentTemplate(dto: CreateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Creating document template', 'DocumentTemplateService', dto);

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

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'create document template',
      'DocumentTemplateService'
    );
  }

  async updateDocumentTemplate(id: string, dto: UpdateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Updating document template', 'DocumentTemplateService', { id, dto });

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

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'update document template',
      'DocumentTemplateService'
    );
  }

  async generateDocument(dto: GenerateDocumentDto): Promise<GeneratedDocumentDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Generating document', 'DocumentTemplateService', dto);

    const command = new GenerateDocumentCommand(
      dto.templateId,
      dto.reservationId,
      dto.variables,
      dto.generatedBy
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'generate document',
      'DocumentTemplateService'
    );
  }

  async uploadDocumentTemplate(file: any, dto: UploadDocumentTemplateDto): Promise<DocumentTemplateDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Uploading document template', 'DocumentTemplateService', { dto, fileName: file.originalname });

    const command = new UploadDocumentTemplateCommand(
      dto.templateId,
      file,
      dto.uploadedBy
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'upload document template',
      'DocumentTemplateService'
    );
  }

  async deleteDocumentTemplate(dto: DeleteDocumentTemplateDto): Promise<void> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Deleting document template', 'DocumentTemplateService', dto);

    const command = new DeleteDocumentTemplateCommand(
      dto.id,
      dto.deletedBy
    );

    await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'delete document template',
      'DocumentTemplateService'
    );
  }

  async getDocumentTemplates(dto: GetDocumentTemplatesDto): Promise<{ templates: DocumentTemplateDto[]; total: number }> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting document templates', 'DocumentTemplateService', dto);

    const query = new GetDocumentTemplatesQuery(
      dto.resourceType,
      dto.categoryId,
      dto.eventType,
      dto.isActive,
      dto.page,
      dto.limit
    );

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get document templates',
      'DocumentTemplateService'
    );
  }

  async getDocumentTemplateById(id: string): Promise<DocumentTemplateDto | null> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting document template by ID', 'DocumentTemplateService', { id });

    const query = new GetDocumentTemplateByIdQuery(id);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get document template by ID',
      'DocumentTemplateService'
    );
  }

  async getDefaultDocumentTemplate(dto: GetDefaultDocumentTemplateDto): Promise<DocumentTemplateDto | null> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting default document template', 'DocumentTemplateService', dto);

    const query = new GetDefaultDocumentTemplateQuery(
      dto.resourceType,
      dto.categoryId,
      dto.eventType
    );

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get default document template',
      'DocumentTemplateService'
    );
  }

  async getGeneratedDocumentsByReservation(reservationId: string): Promise<GeneratedDocumentDto[]> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting generated documents by reservation', 'DocumentTemplateService', { reservationId });

    const query = new GetGeneratedDocumentsByReservationQuery(reservationId);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get generated documents by reservation',
      'DocumentTemplateService'
    );
  }

  async getGeneratedDocumentById(id: string): Promise<GeneratedDocumentDto | null> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting generated document by ID', 'DocumentTemplateService', { id });

    const query = new GetGeneratedDocumentByIdQuery(id);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get generated document by ID',
      'DocumentTemplateService'
    );
  }

  async getDocumentTemplateVariables(templateId: string): Promise<any> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting document template variables', 'DocumentTemplateService', { templateId });

    const query = new GetDocumentTemplateVariablesQuery(templateId);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get document template variables',
      'DocumentTemplateService'
    );
  }

  async getAvailableDocumentVariables(eventType: DocumentEventType, resourceType?: string): Promise<any> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting available document variables', 'DocumentTemplateService', { eventType, resourceType });

    const query = new GetAvailableDocumentVariablesQuery(eventType, resourceType);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get available document variables',
      'DocumentTemplateService'
    );
  }
}
