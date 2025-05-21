import { CreateRoleDto } from '@bookly-monorepo/dto';

export class CreateRoleCommand {
  constructor(public readonly roleData: CreateRoleDto) {}
}
