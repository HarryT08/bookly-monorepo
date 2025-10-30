import { ICommand } from '@nestjs/cqrs';
import { Multer } from 'multer';
import { DocumentFormat } from '@apps/stockpile-service/utils/document-format.enum';
import { DocumentEventType } from '@apps/stockpile-service/utils/document-event-type.enum';

// Create Document Template Command
export class CreateDocumentTemplateCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly eventType: DocumentEventType,
    public readonly format: DocumentFormat,
    public readonly createdBy: string,
    public readonly categoryId?: string,
    public readonly description?: string,
    public readonly resourceType?: string,
    public readonly templatePath?: string,
    public readonly content?: string,
    public readonly variables?: any,
    public readonly isDefault?: boolean,
    public readonly canSendAsAttachment?: boolean,
    public readonly canSendAsLink?: boolean,
  ) {}
}

// Update Document Template Command
export class UpdateDocumentTemplateCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly content?: string,
    public readonly variables?: any,
    public readonly canSendAsAttachment?: boolean,
    public readonly canSendAsLink?: boolean,
    public readonly isActive?: boolean
  ) {}
}

// Generate Document Command
export class GenerateDocumentCommand implements ICommand {
  constructor(
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly variables: any,
    public readonly generatedBy: string
  ) {}
}

// Upload Document Template Command
export class UploadDocumentTemplateCommand implements ICommand {
  constructor(
    public readonly templateId: string,
    public readonly file: Multer.File,
    public readonly uploadedBy: string,
    public readonly fileSize?: number,
    public readonly variables?: any
  ) {}
}

// Delete Document Template Command
export class DeleteDocumentTemplateCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string
  ) {}
}
