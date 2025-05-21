import { UpdateRoleDto } from '@bookly-monorepo/dto';

export class UpdateRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly roleData: UpdateRoleDto,
  ) {}
}
