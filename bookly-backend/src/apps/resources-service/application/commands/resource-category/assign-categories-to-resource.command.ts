import { AssignCategoriesDto } from '@libs/dto/categories';

export class AssignCategoriesToResourceCommand {
  constructor(
    public readonly resourceId: string,
    public readonly dto: AssignCategoriesDto,
    public readonly assignedBy: string,
  ) {}
}
