import { UpdateCategoryDto } from '../../dto/category/update-category.dto';

export class UpdateRoleCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly categoryData: UpdateCategoryDto
  ) {}
}
