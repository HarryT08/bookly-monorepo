export class DocumentTemplateCreatedEvent {
  constructor(
    public readonly templateId: string,
    public readonly name: string,
    public readonly eventType: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly createdBy?: string
  ) {}
}

export class DocumentTemplateUpdatedEvent {
  constructor(
    public readonly templateId: string,
    public readonly name: string,
    public readonly eventType: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string
  ) {}
}

export class DocumentGeneratedEvent {
  constructor(
    public readonly documentId: string,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly fileName: string,
    public readonly filePath: string,
    public readonly generatedBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly fileSize?: number,
    public readonly variables?: any
  ) {}
}

export class DocumentTemplateUploadedEvent {
  constructor(
    public readonly templateId: string,
    public readonly name: string,
    public readonly filePath: string,
    public readonly uploadedBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly fileSize?: number,
    public readonly variables?: any
  ) {}
}

export class DocumentTemplateDeletedEvent {
  constructor(
    public readonly templateId: string,
    public readonly name: string,
    public readonly deletedBy: string
  ) {}
}
