import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { DocumentTemplateRepository } from '../../../domain/repositories/document-template.repository';
import { DocumentTemplateEntity, GeneratedDocumentEntity } from '../../../domain/entities/document-template.entity';
import {
  CreateDocumentTemplateCommand,
  UpdateDocumentTemplateCommand,
  GenerateDocumentCommand,
  UploadDocumentTemplateCommand,
  DeleteDocumentTemplateCommand
} from '../document-template.commands';
import {
  DocumentTemplateCreatedEvent,
  DocumentTemplateUpdatedEvent,
  DocumentGeneratedEvent,
  DocumentTemplateUploadedEvent,
  DocumentTemplateDeletedEvent
} from '../../events/document-template.events';
import { DocumentTemplateDto, GeneratedDocumentDto } from '@dto/stockpile/document-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
@CommandHandler(CreateDocumentTemplateCommand)
export class CreateDocumentTemplateHandler implements ICommandHandler<CreateDocumentTemplateCommand> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateDocumentTemplateCommand): Promise<DocumentTemplateDto> {
    this.loggingService.log('Creating document template', 'CreateDocumentTemplateHandler', LoggingHelper.logParams(command));

    const template = new DocumentTemplateEntity(
      undefined, // ID will be generated
      command.name,
      command.eventType,
      command.format,
      command.createdBy,
      command.description,
      command.resourceType,
      command.categoryId,
      command.templatePath,
      command.content,
      command.variables,
      command.isDefault,
      true, // isActive
      command.canSendAsAttachment,
      command.canSendAsLink,
      new Date(),
      new Date()
    );

    const createdTemplate = await this.repository.createDocumentTemplate(template);

    // Publish event
    await this.eventBus.publish(new DocumentTemplateCreatedEvent(
      createdTemplate.id,
      createdTemplate.name,
      createdTemplate.eventType,
      createdTemplate.resourceType,
      createdTemplate.categoryId,
      createdTemplate.createdBy
    ));

    return this.mapToDto(createdTemplate);
  }

  private mapToDto(template: DocumentTemplateEntity): DocumentTemplateDto {
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
@CommandHandler(UpdateDocumentTemplateCommand)
export class UpdateDocumentTemplateHandler implements ICommandHandler<UpdateDocumentTemplateCommand> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: UpdateDocumentTemplateCommand): Promise<DocumentTemplateDto> {
    this.loggingService.log('Updating document template', 'UpdateDocumentTemplateHandler', LoggingHelper.logParams(command));

    const existingTemplate = await this.repository.findDocumentTemplateById(command.id);
    if (!existingTemplate) {
      throw new Error(`Document template with ID ${command.id} not found`);
    }

    const updatedTemplate = new DocumentTemplateEntity(
      existingTemplate.id,
      command.name || existingTemplate.name,
      existingTemplate.eventType,
      existingTemplate.format,
      existingTemplate.createdBy,
      command.description || existingTemplate.description,
      existingTemplate.resourceType,
      existingTemplate.categoryId,
      existingTemplate.templatePath,
      command.content || existingTemplate.content,
      command.variables || existingTemplate.variables,
      existingTemplate.isDefault,
      command.isActive !== undefined ? command.isActive : existingTemplate.isActive,
      command.canSendAsAttachment !== undefined ? command.canSendAsAttachment : existingTemplate.canSendAsAttachment,
      command.canSendAsLink !== undefined ? command.canSendAsLink : existingTemplate.canSendAsLink,
      existingTemplate.createdAt,
      new Date()
    );

    const savedTemplate = await this.repository.updateDocumentTemplate(updatedTemplate.id, updatedTemplate);

    // Publish event
    await this.eventBus.publish(new DocumentTemplateUpdatedEvent(
      savedTemplate.id,
      savedTemplate.name,
      savedTemplate.eventType,
      savedTemplate.resourceType,
      savedTemplate.categoryId
    ));

    return this.mapToDto(savedTemplate);
  }

  private mapToDto(template: DocumentTemplateEntity): DocumentTemplateDto {
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
@CommandHandler(GenerateDocumentCommand)
export class GenerateDocumentHandler implements ICommandHandler<GenerateDocumentCommand> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: GenerateDocumentCommand): Promise<GeneratedDocumentDto> {
    this.loggingService.log('Generating document', 'GenerateDocumentHandler', LoggingHelper.logParams(command));

    const template = await this.repository.findDocumentTemplateById(command.templateId);
    if (!template) {
      throw new Error(`Document template with ID ${command.templateId} not found`);
    }

    // Generate document (simplified implementation)
    const fileName = `document-${Date.now()}.${template.format.toLowerCase()}`;
    const filePath = `/generated/${fileName}`;
    
    const generatedDocument = new GeneratedDocumentEntity(
      undefined, // ID will be generated
      command.templateId,
      command.reservationId,
      fileName,
      filePath,
      `application/${template.format.toLowerCase()}`,
      command.generatedBy,
      new Date(),
      new Date(),
      null, // fileSize (placeholder)
      command.variables
    );

    const savedDocument = await this.repository.createGeneratedDocument(generatedDocument);

    // Publish event
    await this.eventBus.publish(new DocumentGeneratedEvent(
      savedDocument.id,
      savedDocument.templateId,
      savedDocument.reservationId,
      savedDocument.fileName,
      savedDocument.filePath,
      savedDocument.generatedBy,
      savedDocument.createdAt,
      savedDocument.updatedAt,
      savedDocument.fileSize,
      savedDocument.variables
    ));

    return this.mapToGeneratedDocumentDto(savedDocument);
  }

  private mapToGeneratedDocumentDto(document: GeneratedDocumentEntity): GeneratedDocumentDto {
    return {
      id: document.id,
      templateId: document.templateId,
      reservationId: document.reservationId,
      fileName: document.fileName,
      filePath: document.filePath,
      mimeType: document.mimeType,
      generatedBy: document.generatedBy,
      fileSize: document.fileSize,
      variables: document.variables,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }
}

@Injectable()
@CommandHandler(UploadDocumentTemplateCommand)
export class UploadDocumentTemplateHandler implements ICommandHandler<UploadDocumentTemplateCommand> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: UploadDocumentTemplateCommand): Promise<DocumentTemplateDto> {
    this.loggingService.log('Uploading document template file', 'UploadDocumentTemplateHandler', LoggingHelper.logParams({ 
      templateId: command.templateId,
      fileName: command.file.originalname
    }));

    const existingTemplate = await this.repository.findDocumentTemplateById(command.templateId);
    if (!existingTemplate) {
      throw new Error(`Document template with ID ${command.templateId} not found`);
    }

    // Save file (simplified implementation)
    const filePath = `/templates/${command.file.originalname}`;
    
    const updatedTemplate = new DocumentTemplateEntity(
      existingTemplate.id,
      existingTemplate.name,
      existingTemplate.eventType,
      existingTemplate.format,
      existingTemplate.createdBy,
      existingTemplate.description,
      existingTemplate.resourceType,
      existingTemplate.categoryId,
      filePath,
      existingTemplate.content,
      existingTemplate.variables,
      existingTemplate.isDefault,
      existingTemplate.isActive,
      existingTemplate.canSendAsAttachment,
      existingTemplate.canSendAsLink,
      existingTemplate.createdAt,
      new Date()
    );

    const savedTemplate = await this.repository.updateDocumentTemplate(updatedTemplate.id, updatedTemplate);

    // Publish event
    await this.eventBus.publish(new DocumentTemplateUploadedEvent(
      savedTemplate.id,
      savedTemplate.name,
      filePath,
      command.uploadedBy,
      new Date(),
      new Date(),
      command.fileSize,
      command.variables
    ));

    return this.mapToDto(savedTemplate);
  }

  private mapToDto(template: DocumentTemplateEntity): DocumentTemplateDto {
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
@CommandHandler(DeleteDocumentTemplateCommand)
export class DeleteDocumentTemplateHandler implements ICommandHandler<DeleteDocumentTemplateCommand> {
  constructor(
    @Inject('DocumentTemplateRepository') private readonly repository: DocumentTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: DeleteDocumentTemplateCommand): Promise<void> {
    this.loggingService.log('Deleting document template', 'DeleteDocumentTemplateHandler', LoggingHelper.logParams(command));

    const existingTemplate = await this.repository.findDocumentTemplateById(command.id);
    if (!existingTemplate) {
      throw new Error(`Document template with ID ${command.id} not found`);
    }

    await this.repository.deleteDocumentTemplate(command.id);

    // Publish event
    await this.eventBus.publish(new DocumentTemplateDeletedEvent(
      command.id,
      existingTemplate.name,
      command.deletedBy
    ));
  }
}
