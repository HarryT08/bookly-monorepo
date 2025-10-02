import { RemoveCategoriesDto } from '@libs/dto/categories';

export class RemoveCategoriesFromRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly dto: RemoveCategoriesDto,
    public readonly removedBy: string,
  ) {}
}
