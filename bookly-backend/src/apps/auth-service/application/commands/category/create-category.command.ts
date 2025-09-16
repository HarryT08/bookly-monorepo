import { CreateCategoryDto } from '../../dto/category/create-category.dto';

export class CreateRoleCategoryCommand {
  constructor(public readonly categoryData: CreateCategoryDto) {}
}
