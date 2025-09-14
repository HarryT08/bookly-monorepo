import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { DocumentTemplateService } from '@apps/stockpile-service/application/services/document-template.service';
import {
  GetDocumentTemplatesQuery,
  GetDocumentTemplateByIdQuery,
  GetDefaultDocumentTemplateQuery,
  GetGeneratedDocumentsByReservationQuery,
  GetGeneratedDocumentByIdQuery,
  GetDocumentTemplateVariablesQuery,
  GetAvailableDocumentVariablesQuery
} from '../document-template.queries';
import { DocumentTemplateDto, GeneratedDocumentDto } from '@dto/stockpile/document-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
@QueryHandler(GetDocumentTemplatesQuery)
export class GetDocumentTemplatesHandler implements IQueryHandler<GetDocumentTemplatesQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDocumentTemplatesQuery): Promise<{ templates: DocumentTemplateDto[]; total: number }> {
    this.loggingService.log('Orchestrating get document templates query', 'GetDocumentTemplatesHandler', LoggingHelper.logParams(query));

    const result = await this.documentTemplateService.getDocumentTemplates({
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      eventType: query.eventType,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit
    });

    return result;
  }
}

@Injectable()
@QueryHandler(GetDocumentTemplateByIdQuery)
export class GetDocumentTemplateByIdHandler implements IQueryHandler<GetDocumentTemplateByIdQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDocumentTemplateByIdQuery): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Orchestrating get document template by ID query', 'GetDocumentTemplateByIdHandler', LoggingHelper.logParams(query));

    const template = await this.documentTemplateService.getDocumentTemplateById({ id: query.id });
    return template;
  }
}

@Injectable()
@QueryHandler(GetDefaultDocumentTemplateQuery)
export class GetDefaultDocumentTemplateHandler implements IQueryHandler<GetDefaultDocumentTemplateQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDefaultDocumentTemplateQuery): Promise<DocumentTemplateDto | null> {
    this.loggingService.log('Orchestrating get default document template query', 'GetDefaultDocumentTemplateHandler', LoggingHelper.logParams(query));

    return await this.documentTemplateService.getDefaultDocumentTemplate({
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      eventType: query.eventType
    });
  }
}

@Injectable()
@QueryHandler(GetGeneratedDocumentsByReservationQuery)
export class GetGeneratedDocumentsByReservationHandler implements IQueryHandler<GetGeneratedDocumentsByReservationQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetGeneratedDocumentsByReservationQuery): Promise<GeneratedDocumentDto[]> {
    this.loggingService.log('Orchestrating get generated documents by reservation query', 'GetGeneratedDocumentsByReservationHandler', LoggingHelper.logParams(query));

    const documents = await this.documentTemplateService.getGeneratedDocumentsByReservation({ reservationId: query.reservationId });
    return documents;
  }
}

@Injectable()
@QueryHandler(GetGeneratedDocumentByIdQuery)
export class GetGeneratedDocumentByIdHandler implements IQueryHandler<GetGeneratedDocumentByIdQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetGeneratedDocumentByIdQuery): Promise<GeneratedDocumentDto | null> {
    this.loggingService.log('Orchestrating get generated document by ID query', 'GetGeneratedDocumentByIdHandler', LoggingHelper.logParams(query));

    const document = await this.documentTemplateService.getGeneratedDocumentById({ id: query.id });
    return document;
  }
}

@Injectable()
@QueryHandler(GetDocumentTemplateVariablesQuery)
export class GetDocumentTemplateVariablesHandler implements IQueryHandler<GetDocumentTemplateVariablesQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDocumentTemplateVariablesQuery): Promise<any> {
    this.loggingService.log('Orchestrating get document template variables query', 'GetDocumentTemplateVariablesHandler', LoggingHelper.logParams(query));

    const variables = await this.documentTemplateService.getDocumentTemplateVariables({ templateId: query.templateId });
    return variables;
  }
}

@Injectable()
@QueryHandler(GetAvailableDocumentVariablesQuery)
export class GetAvailableDocumentVariablesHandler implements IQueryHandler<GetAvailableDocumentVariablesQuery> {
  constructor(
    private readonly documentTemplateService: DocumentTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetAvailableDocumentVariablesQuery): Promise<any> {
    this.loggingService.log('Orchestrating get available document variables query', 'GetAvailableDocumentVariablesHandler', LoggingHelper.logParams(query));

    return await this.documentTemplateService.getAvailableDocumentVariables();
  }
}
