import { IQuery } from '@nestjs/cqrs';
import { ImportStatus } from '@apps/resources-service/utils/import-status.enum';

/**
 * Get Import Status Query
 */
export class GetImportStatusQuery implements IQuery {
  constructor(public readonly importId: string) {}
}

/**
 * Get Import By ID Query
 */
export class GetImportByIdQuery implements IQuery {
  constructor(public readonly importId: string) {}
}

/**
 * Get Imports By User Query
 */
export class GetImportsByUserQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

/**
 * Get Imports Query with pagination and filters
 */
export class GetImportsQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly filters?: {
      userId?: string;
      status?: ImportStatus;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}

/**
 * Get Import Statistics Query
 */
export class GetImportStatisticsQuery implements IQuery {
  constructor(public readonly userId?: string) {}
}

/**
 * Get Import History Query
 */
export class GetImportHistoryQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly userId?: string
  ) {}
}

/**
 * Get Import Template Query
 */
export class GetImportTemplateQuery implements IQuery {
  constructor() {}
}
