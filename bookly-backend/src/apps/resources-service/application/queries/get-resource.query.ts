import { IQuery } from '@nestjs/cqrs';

/**
 * Get Resource Query
 * Retrieves a single resource by ID
 */
export class GetResourceQuery implements IQuery {
  constructor(public readonly id: string) {}
}

/**
 * Get Resource by Code Query
 * Retrieves a single resource by unique code
 */
export class GetResourceByCodeQuery implements IQuery {
  constructor(public readonly code: string) {}
}
