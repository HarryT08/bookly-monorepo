import { AssignCategoriesDto } from '@libs/dto/categories';

export class AssignCategoriesToRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly dto: AssignCategoriesDto,
    public readonly assignedBy: string,
  ) {}
}
