import { UpdateCategoryDto } from '@/libs/dto/categories/update-category.dto';

/**
 * Update Category Command
 * 
 * Command for updating an existing category in the resources service.
 */
export class UpdateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly updateCategoryDto: UpdateCategoryDto,
    public readonly userId: string,
  ) {}
}
