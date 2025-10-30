import { CategoryFiltersDto } from "@libs/dto/categories/filter-categories.dto";

/**
 * Get Categories Query
 * 
 * Query for retrieving categories with pagination and filters.
 */
export class GetCategoriesQuery {
  constructor(
    public readonly filters: CategoryFiltersDto,
  ) {}
}
