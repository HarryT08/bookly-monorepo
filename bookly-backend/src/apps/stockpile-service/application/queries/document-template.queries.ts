import { IQuery } from '@nestjs/cqrs';
import { DocumentEventType } from '../../utils/document-event-type.enum';

// Get Document Templates Query
export class GetDocumentTemplatesQuery implements IQuery {
  constructor(
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly eventType?: DocumentEventType,
    public readonly isActive?: boolean,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

// Get Document Template by ID Query
export class GetDocumentTemplateByIdQuery implements IQuery {
  constructor(
    public readonly id: string
  ) {}
}

// Get Default Document Template Query
export class GetDefaultDocumentTemplateQuery implements IQuery {
  constructor(
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly eventType?: DocumentEventType
  ) {}
}

// Get Generated Documents by Reservation Query
export class GetGeneratedDocumentsByReservationQuery implements IQuery {
  constructor(
    public readonly reservationId: string
  ) {}
}

// Get Generated Document by ID Query
export class GetGeneratedDocumentByIdQuery implements IQuery {
  constructor(
    public readonly id: string
  ) {}
}

// Get Document Template Variables Query
export class GetDocumentTemplateVariablesQuery implements IQuery {
  constructor(
    public readonly templateId: string
  ) {}
}

// Get Available Document Variables Query
export class GetAvailableDocumentVariablesQuery implements IQuery {
  constructor(
    public readonly eventType: DocumentEventType,
    public readonly resourceType?: string
  ) {}
}
