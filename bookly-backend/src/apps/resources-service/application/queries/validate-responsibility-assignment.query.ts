import { IQuery } from '@nestjs/cqrs';

/**
 * Validate Responsibility Assignment Query
 */
export class ValidateResponsibilityAssignmentQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly userIds: string[]
  ) {}
}
