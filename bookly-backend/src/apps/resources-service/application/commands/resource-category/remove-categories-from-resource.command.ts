import { RemoveCategoriesDto } from '@libs/dto/categories';

export class RemoveCategoriesFromResourceCommand {
  constructor(
    public readonly resourceId: string,
    public readonly dto: RemoveCategoriesDto,
    public readonly removedBy: string,
  ) {}
}
