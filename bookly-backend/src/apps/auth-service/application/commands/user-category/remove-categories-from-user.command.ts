import { RemoveCategoriesDto } from '@libs/dto/categories';

export class RemoveCategoriesFromUserCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: RemoveCategoriesDto,
    public readonly removedBy: string,
  ) {}
}
