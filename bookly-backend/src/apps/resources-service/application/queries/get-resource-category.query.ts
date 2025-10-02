import { IQuery } from '@nestjs/cqrs';

/**
 * Get Resource Categories Query - Gets all categories assigned to a resource
 */
export class GetResourceCategoriesQuery implements IQuery {
  constructor(public readonly resourceId: string) {}
}

/**
 * Get Resources By Category Query - Gets all resources assigned to a category
 */
export class GetResourcesByCategoryQuery implements IQuery {
  constructor(
    public readonly categoryId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

/**
 * Check Resource Category Assignment Query - Checks if a resource is assigned to a category
 */
export class CheckResourceCategoryAssignmentQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly categoryId: string
  ) {}
}
