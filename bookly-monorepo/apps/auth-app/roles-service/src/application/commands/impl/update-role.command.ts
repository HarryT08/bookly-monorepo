import { UpdateRoleDto } from '../../../infrastructure/dtos/update-role.dto';

export class UpdateRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly roleData: UpdateRoleDto,
  ) {}
}
