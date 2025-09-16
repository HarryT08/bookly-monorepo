import { AssignCategoriesDto } from '@libs/dto/categories';

export class AssignCategoriesToUserCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: AssignCategoriesDto,
    public readonly assignedBy: string,
  ) {}
}
