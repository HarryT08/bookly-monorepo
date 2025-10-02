import { CreateCategoryDto } from "@/libs/dto/categories/create-category.dto";

/**
 * Create Category Command
 * 
 * Command for creating a new category in the resources service.
 */
export class CreateCategoryCommand {
  constructor(
    public readonly createCategoryDto: CreateCategoryDto,
    public readonly userId: string,
  ) {}
}
