import { CreateRoleDto } from '../../../infrastructure/dtos/create-role.dto';

export class CreateRoleCommand {
  constructor(public readonly roleData: CreateRoleDto) {}
}
