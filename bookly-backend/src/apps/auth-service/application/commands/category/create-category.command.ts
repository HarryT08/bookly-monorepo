import { CreateCategoryDto } from '@/libs/dto/categories/create-category.dto';

export class CreateRoleCategoryCommand {
  constructor(public readonly categoryData: CreateCategoryDto) {}
}
