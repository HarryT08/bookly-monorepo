import { DocumentTemplateEntity, GeneratedDocumentEntity } from '../entities/document-template.entity';
import { DocumentEventType } from '../../utils/document-event-type.enum';

export interface DocumentTemplateRepository {
  findDocumentTemplates(filters: { resourceType: string; categoryId: string; eventType: DocumentEventType; isActive: boolean; page: number; limit: number; }): Promise<{ templates: DocumentTemplateEntity[]; total: number }>;
  findGeneratedDocumentsByReservation(reservationId: string): Promise<GeneratedDocumentEntity[]>;
  // Document Template operations
  createDocumentTemplate(template: DocumentTemplateEntity): Promise<DocumentTemplateEntity>;
  updateDocumentTemplate(id: string, template: Partial<DocumentTemplateEntity>): Promise<DocumentTemplateEntity>;
  findDocumentTemplateById(id: string): Promise<DocumentTemplateEntity | null>;
  findDocumentTemplatesByScope(resourceType?: string, categoryId?: string, eventType?: DocumentEventType): Promise<DocumentTemplateEntity[]>;
  findDefaultDocumentTemplate(resourceType?: string, categoryId?: string, eventType?: DocumentEventType): Promise<DocumentTemplateEntity | null>;
  deleteDocumentTemplate(id: string): Promise<void>;
  
  // Generated Document operations
  createGeneratedDocument(document: GeneratedDocumentEntity): Promise<GeneratedDocumentEntity>;
  findGeneratedDocumentById(id: string): Promise<GeneratedDocumentEntity | null>;
  findGeneratedDocumentsByReservationId(reservationId: string): Promise<GeneratedDocumentEntity[]>;
  findGeneratedDocumentsByTemplateId(templateId: string): Promise<GeneratedDocumentEntity[]>;
  deleteGeneratedDocument(id: string): Promise<void>;
}
