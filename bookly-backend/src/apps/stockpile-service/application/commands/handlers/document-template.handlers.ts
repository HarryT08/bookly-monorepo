import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { DocumentTemplateService } from '@apps/stockpile-service/application/services/document-template.service';
import { DocumentTemplateEntity, GeneratedDocumentEntity } from '@apps/stockpile-service/domain/entities/document-template.entity';
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

/**
 * Create Document Template Command Handler
 * Orchestrates document template creation by delegating to DocumentTemplateService
 */
@Injectable()
@CommandHandler(CreateDocumentTemplateCommand)
export class CreateDocumentTemplateHandler implements ICommandHandler<CreateDocumentTemplateCommand> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateDocumentTemplateCommand): Promise<DocumentTemplateDto> {
    this.loggingService.log('Orchestrating create document template command', 'CreateDocumentTemplateHandler', LoggingHelper.logParams(command));

    const result = await this.documentTemplateService.createDocumentTemplate({
      name: command.name,
      eventType: command.eventType,
      format: command.format,
      createdBy: command.createdBy,
      description: command.description,
      resourceType: command.resourceType,
      categoryId: command.categoryId,
      templatePath: command.templatePath,
      content: command.content,
      variables: command.variables,
      isDefault: command.isDefault,
      canSendAsAttachment: command.canSendAsAttachment,
      canSendAsLink: command.canSendAsLink
    });

    this.loggingService.log('Create document template command completed', 'CreateDocumentTemplateHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Update Document Template Command Handler  
 * Orchestrates document template updates by delegating to DocumentTemplateService
 */
@Injectable()
@CommandHandler(UpdateDocumentTemplateCommand)
export class UpdateDocumentTemplateHandler implements ICommandHandler<UpdateDocumentTemplateCommand> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: UpdateDocumentTemplateCommand): Promise<DocumentTemplateDto> {
    this.loggingService.log('Orchestrating update document template command', 'UpdateDocumentTemplateHandler', LoggingHelper.logParams(command));

    const result = await this.documentTemplateService.updateDocumentTemplate(command.id, {
      name: command.name,
      description: command.description,
      content: command.content,
      variables: command.variables,
      isActive: command.isActive,
      canSendAsAttachment: command.canSendAsAttachment,
      canSendAsLink: command.canSendAsLink
    });

    this.loggingService.log('Update document template command completed', 'UpdateDocumentTemplateHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Generate Document Command Handler
 * Orchestrates document generation by delegating to DocumentTemplateService
 */
@Injectable()
@CommandHandler(GenerateDocumentCommand)
export class GenerateDocumentHandler implements ICommandHandler<GenerateDocumentCommand> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: GenerateDocumentCommand): Promise<GeneratedDocumentDto> {
    this.loggingService.log('Orchestrating generate document command', 'GenerateDocumentHandler', LoggingHelper.logParams(command));

    const result = await this.documentTemplateService.generateDocument({
      templateId: command.templateId,
      reservationId: command.reservationId,
      generatedBy: command.generatedBy,
      variables: command.variables
    });

    this.loggingService.log('Generate document command completed', 'GenerateDocumentHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Upload Document Template Command Handler
 * Orchestrates document template uploads by delegating to DocumentTemplateService
 */
@Injectable()
@CommandHandler(UploadDocumentTemplateCommand)
export class UploadDocumentTemplateHandler implements ICommandHandler<UploadDocumentTemplateCommand> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: UploadDocumentTemplateCommand): Promise<DocumentTemplateDto> {
    this.loggingService.log('Orchestrating upload document template command', 'UploadDocumentTemplateHandler', LoggingHelper.logParams({ 
      templateId: command.templateId,
      fileName: command.file?.originalname
    }));

    const result = await this.documentTemplateService.uploadDocumentTemplate(
      command.file,
      {
        templateId: command.templateId,
        uploadedBy: command.uploadedBy
      }
    );

    this.loggingService.log('Upload document template command completed', 'UploadDocumentTemplateHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Delete Document Template Command Handler
 * Orchestrates document template deletion by delegating to DocumentTemplateService
 */
@Injectable()
@CommandHandler(DeleteDocumentTemplateCommand)
export class DeleteDocumentTemplateHandler implements ICommandHandler<DeleteDocumentTemplateCommand> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: DeleteDocumentTemplateCommand): Promise<void> {
    this.loggingService.log('Orchestrating delete document template command', 'DeleteDocumentTemplateHandler', LoggingHelper.logParams(command));

    await this.documentTemplateService.deleteDocumentTemplate({
      id: command.id,
      deletedBy: command.deletedBy
    });

    this.loggingService.log('Delete document template command completed', 'DeleteDocumentTemplateHandler');
  }
}
