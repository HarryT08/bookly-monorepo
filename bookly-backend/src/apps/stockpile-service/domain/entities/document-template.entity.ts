import { DocumentEventType } from '../../utils/document-event-type.enum';
import { DocumentFormat } from '../../utils/document-format.enum';

export class DocumentTemplateEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly eventType: DocumentEventType,
    public readonly format: DocumentFormat,
    public readonly createdBy: string,
    public readonly description?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly templatePath?: string,
    public readonly content?: string,
    public readonly variables: any = {},
    public readonly isDefault: boolean = false,
    public readonly isActive: boolean = true,
    public readonly canSendAsAttachment: boolean = true,
    public readonly canSendAsLink: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public canGenerateDocument(): boolean {
    return !!this.isActive && (!!this.templatePath || !!this.content);
  }

  public getVariableNames(): string[] {
    if (!this.variables || typeof this.variables !== 'object') {
      return [];
    }
    return Object.keys(this.variables);
  }

  public validateVariables(providedVariables: any): { isValid: boolean; missingVariables: string[] } {
    const requiredVariables = this.getVariableNames();
    const providedKeys = Object.keys(providedVariables || {});
    const missingVariables = requiredVariables.filter(variable => !providedKeys.includes(variable));
    
    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  public replaceVariables(content: string, variables: any): string {
    let processedContent = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      processedContent = processedContent.replace(regex, String(value || ''));
    }
    
    return processedContent;
  }

  public isApplicableForScope(resourceType?: string, categoryId?: string): boolean {
    // If template has no scope restrictions, it applies to all
    if (!this.resourceType && !this.categoryId) {
      return true;
    }

    // Check resource type match
    if (this.resourceType && resourceType !== this.resourceType) {
      return false;
    }

    // Check category match
    if (this.categoryId && categoryId !== this.categoryId) {
      return false;
    }

    return true;
  }
}

export class GeneratedDocumentEntity {
  constructor(
    public readonly id: string,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly fileName: string,
    public readonly filePath: string,
    public readonly mimeType: string,
    public readonly generatedBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly fileSize?: number,
    public readonly variables?: any,
  ) {}

  public getDownloadUrl(baseUrl: string): string {
    return `${baseUrl}/documents/${this.id}/download`;
  }

  public isValidFile(): boolean {
    return !!this.fileName && !!this.filePath && !!this.mimeType;
  }

  public getFileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  public canBeAttached(): boolean {
    // Check file size limits for attachments (e.g., 10MB)
    const maxAttachmentSize = 10 * 1024 * 1024; // 10MB
    return !this.fileSize || this.fileSize <= maxAttachmentSize;
  }
}
