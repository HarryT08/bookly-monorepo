import { AssignCategoriesDto } from '@libs/dto/categories';

export class AssignCategoriesToProgramCommand {
  constructor(
    public readonly programId: string,
    public readonly dto: AssignCategoriesDto,
    public readonly assignedBy: string,
  ) {}
}
