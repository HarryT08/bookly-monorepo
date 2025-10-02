import { CreateCategoryDto } from '@libs/dto/categories';

export class CreateCategoryCommand {
  constructor(
    public readonly createCategoryDto: CreateCategoryDto,
    public readonly createdBy?: string,
  ) {}
}
