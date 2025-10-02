import { RemoveCategoriesDto } from '@libs/dto/categories';

export class RemoveCategoriesFromProgramCommand {
  constructor(
    public readonly programId: string,
    public readonly dto: RemoveCategoriesDto,
    public readonly removedBy: string,
  ) {}
}
