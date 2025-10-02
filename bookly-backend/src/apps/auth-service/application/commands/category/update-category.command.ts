import { UpdateCategoryDto } from '@/libs/dto/categories/update-category.dto';

export class UpdateRoleCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly categoryData: UpdateCategoryDto
  ) {}
}
