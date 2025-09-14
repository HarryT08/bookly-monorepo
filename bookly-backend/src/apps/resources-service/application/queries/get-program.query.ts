import { IQuery } from '@nestjs/cqrs';

/**
 * Get Program by ID Query
 */
export class GetProgramQuery implements IQuery {
  constructor(public readonly id: string) {}
}

/**
 * Get Program by Code Query
 */
export class GetProgramByCodeQuery implements IQuery {
  constructor(public readonly code: string) {}
}

/**
 * Get Programs Query
 */
export class GetProgramsQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly isActive?: boolean
  ) {}
}

/**
 * Get Active Programs Query
 */
export class GetActiveProgramsQuery implements IQuery {
  constructor() {}
}
