import { UpdateCategoryDto } from '@libs/dto/categories';

export class UpdateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly updateCategoryDto: UpdateCategoryDto,
    public readonly updatedBy?: string,
  ) {}
}
