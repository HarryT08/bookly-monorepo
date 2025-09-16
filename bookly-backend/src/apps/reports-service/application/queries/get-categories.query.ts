interface CategoryFilters {
  name?: string;
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export class GetCategoriesQuery {
  constructor(
    public readonly filters: CategoryFilters = {},
    public readonly pagination: PaginationParams = {},
  ) {}
}
