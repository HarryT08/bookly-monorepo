import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
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
import {
  GetByIdRequestDto,
  GetGeneratedDocumentsByReservationRequestDto,
  GetDocumentTemplateVariablesRequestDto
} from '@libs/dto/stockpile/stockpile-requests.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { DocumentTemplateRepository } from '@apps/stockpile-service/domain/repositories/document-template.repository';
import { DocumentTemplateEntity, GeneratedDocumentEntity } from '@apps/stockpile-service/domain/entities/document-template.entity';
import { DocumentFormat } from '@apps/stockpile-service/utils/document-format.enum';

@Injectable()
export class DocumentTemplateService {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly documentTemplateRepository: DocumentTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async createDocumentTemplate(dto: CreateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    this.loggingService.log('Creating document template', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const entity = new DocumentTemplateEntity(
      null, // id will be set by repository
      dto.name,
      dto.eventType as DocumentEventType,
      dto.format,
      dto.createdBy,
      dto.description,
      dto.resourceType,
      dto.categoryId,
      dto.templatePath,
      dto.content,
      dto.variables || {},
      dto.isDefault || false,
      true, // isActive
      dto.canSendAsAttachment || false,
      dto.canSendAsLink || false,
      new Date(),
      new Date()
    );

    const savedEntity = await this.documentTemplateRepository.createDocumentTemplate(entity);
    return this.convertDocumentTemplateToDto(savedEntity);
  }

  async updateDocumentTemplate(id: string, dto: UpdateDocumentTemplateDto): Promise<DocumentTemplateDto> {
    this.loggingService.log('Updating document template', 'DocumentTemplateService', LoggingHelper.logParams({ id, dto }));

    const existingTemplate = await this.documentTemplateRepository.findDocumentTemplateById(id);
    if (!existingTemplate) {
      throw new NotFoundException(`Document template with ID ${id} not found`);
    }

    await this.documentTemplateRepository.updateDocumentTemplate(id, {
      name: dto.name,
      description: dto.description,
      content: dto.content,
      variables: dto.variables,
      canSendAsAttachment: dto.canSendAsAttachment,
      canSendAsLink: dto.canSendAsLink,
      isActive: dto.isActive,
      updatedAt: new Date()
    });

    const updatedTemplate = await this.documentTemplateRepository.findDocumentTemplateById(id);
    return this.convertDocumentTemplateToDto(updatedTemplate);
  }

  async generateDocument(dto: GenerateDocumentDto): Promise<GeneratedDocumentDto> {
    this.loggingService.log('Generating document', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    // Validate template exists
    const template = await this.documentTemplateRepository.findDocumentTemplateById(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Document template with ID ${dto.templateId} not found`);
    }

    const entity = new GeneratedDocumentEntity(
      null, // id will be set by repository
      dto.templateId,
      dto.reservationId,
      `document_${dto.reservationId}_${Date.now()}.pdf`,
      `/documents/${dto.reservationId}/`,
      'application/pdf',
      dto.generatedBy,
      new Date(),
      new Date(),
      0, // fileSize will be set after generation
      dto.variables || {}
    );

    const savedEntity = await this.documentTemplateRepository.createGeneratedDocument(entity);
    return this.convertGeneratedDocumentToDto(savedEntity);
  }

  async uploadDocumentTemplate(file: any, dto: UploadDocumentTemplateDto): Promise<DocumentTemplateDto> {
    this.loggingService.log('Uploading document template', 'DocumentTemplateService', LoggingHelper.logParams({ dto, fileName: file.originalname }));

    const existingTemplate = await this.documentTemplateRepository.findDocumentTemplateById(dto.templateId);
    if (!existingTemplate) {
      throw new NotFoundException(`Document template with ID ${dto.templateId} not found`);
    }

    const filePath = `/templates/${dto.templateId}/${file.originalname}`;
    await this.documentTemplateRepository.updateDocumentTemplate(dto.templateId, {
      templatePath: filePath,
      updatedAt: new Date()
    });

    const updatedTemplate = await this.documentTemplateRepository.findDocumentTemplateById(dto.templateId);
    return this.convertDocumentTemplateToDto(updatedTemplate);
  }

  async deleteDocumentTemplate(dto: DeleteDocumentTemplateDto): Promise<void> {
    this.loggingService.log('Deleting document template', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const existingTemplate = await this.documentTemplateRepository.findDocumentTemplateById(dto.id);
    if (!existingTemplate) {
      throw new NotFoundException(`Document template with ID ${dto.id} not found`);
    }

    await this.documentTemplateRepository.deleteDocumentTemplate(dto.id);
  }

  async getDocumentTemplates(dto: GetDocumentTemplatesDto): Promise<{ templates: DocumentTemplateDto[]; total: number }> {
    this.loggingService.log('Getting document templates', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const result = await this.documentTemplateRepository.findDocumentTemplates({
      resourceType: dto.resourceType,
      categoryId: dto.categoryId,
      eventType: dto.eventType,
      isActive: dto.isActive,
      page: dto.page,
      limit: dto.limit
    });

    return {
      templates: result.templates.map(template => this.convertDocumentTemplateToDto(template)),
      total: result.total
    };
  }

  async getDocumentTemplateById(dto: GetByIdRequestDto): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Getting document template by ID', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const template = await this.documentTemplateRepository.findDocumentTemplateById(dto.id);
    return template ? this.convertDocumentTemplateToDto(template) : null;
  }

  async getDefaultDocumentTemplate(dto: GetDefaultDocumentTemplateDto): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Getting default document template', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const template = await this.documentTemplateRepository.findDefaultDocumentTemplate(
      dto.resourceType,
      dto.categoryId,
      dto.eventType
    );

    return template ? this.convertDocumentTemplateToDto(template) : null;
  }

  async getGeneratedDocumentsByReservation(dto: GetGeneratedDocumentsByReservationRequestDto): Promise<GeneratedDocumentDto[]> {
    this.loggingService.log('Getting generated documents by reservation', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const documents = await this.documentTemplateRepository.findGeneratedDocumentsByReservation(dto.reservationId);
    return documents.map(doc => this.convertGeneratedDocumentToDto(doc));
  }

  async getGeneratedDocumentById(dto: GetByIdRequestDto): Promise<GeneratedDocumentDto | null> {
    this.loggingService.log('Getting generated document by ID', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const document = await this.documentTemplateRepository.findGeneratedDocumentById(dto.id);
    return document ? this.convertGeneratedDocumentToDto(document) : null;
  }

  async getDocumentTemplateVariables(dto: GetDocumentTemplateVariablesRequestDto): Promise<Record<string, any>> {
    this.loggingService.log('Getting document template variables', 'DocumentTemplateService', LoggingHelper.logParams(dto));

    const template = await this.documentTemplateRepository.findDocumentTemplateById(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Document template with ID ${dto.templateId} not found`);
    }

    return template.variables || {};
  }

  async getAvailableDocumentVariables(): Promise<Record<string, any>> {
    this.loggingService.log('Getting available document variables', 'DocumentTemplateService', LoggingHelper.logParams({}));

    // Return standard document variables available for templates
    return {
      reservation: {
        id: 'string',
        startDate: 'Date',
        endDate: 'Date',
        status: 'string',
        notes: 'string'
      },
      resource: {
        name: 'string',
        type: 'string',
        location: 'string',
        capacity: 'number'
      },
      user: {
        name: 'string',
        email: 'string',
        role: 'string'
      },
      approval: {
        status: 'string',
        approverName: 'string',
        approvalDate: 'Date',
        comments: 'string'
      }
    };
  }

  // DTO Conversion Methods
  private convertDocumentTemplateToDto(entity: DocumentTemplateEntity): DocumentTemplateDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      resourceType: entity.resourceType,
      categoryId: entity.categoryId,
      eventType: entity.eventType,
      format: entity.format,
      templatePath: entity.templatePath,
      content: entity.content,
      variables: entity.variables,
      isDefault: entity.isDefault,
      isActive: entity.isActive,
      canSendAsAttachment: entity.canSendAsAttachment,
      canSendAsLink: entity.canSendAsLink,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private convertGeneratedDocumentToDto(entity: GeneratedDocumentEntity): GeneratedDocumentDto {
    return {
      id: entity.id,
      templateId: entity.templateId,
      reservationId: entity.reservationId,
      fileName: entity.fileName,
      filePath: entity.filePath,
      documentPath: entity.filePath,
      fileSize: entity.fileSize || 0,
      format: DocumentFormat.PDF, // Default format since not stored in entity
      mimeType: entity.mimeType,
      variables: entity.variables,
      generatedBy: entity.generatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
