import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { I18nContext } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';

@Injectable()
export class RolesService {
  private roles = [
    { id: '1', name: 'admin' },
    { id: '2', name: 'user' },
  ];
  private userRoles = {} as Record<string, string[]>;
  constructor(private readonly logger: Logger) {}

  async createRole(createRoleDto: CreateRoleDto, i18n: I18nContext) {
    const newRole = { id: (this.roles.length + 1).toString(), name: createRoleDto.name };
    this.roles.push(newRole);
    this.logger.info('Role created', newRole);
    return { message: await i18n.t('roles.CREATE_SUCCESS'), role: newRole };
  }

  async getRoles(i18n: I18nContext) {
    return { roles: this.roles };
  }

  async updateRole(id: string, createRoleDto: CreateRoleDto, i18n: I18nContext) {
    const role = this.roles.find(r => r.id === id);
    if (!role) throw new NotFoundException(await i18n.t('roles.NOT_FOUND'));
    role.name = createRoleDto.name;
    this.logger.info('Role updated', role);
    return { message: await i18n.t('roles.UPDATE_SUCCESS'), role };
  }

  async deleteRole(id: string, i18n: I18nContext) {
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx === -1) throw new NotFoundException(await i18n.t('roles.NOT_FOUND'));
    const deleted = this.roles.splice(idx, 1);
    this.logger.info('Role deleted', deleted[0]);
    return { message: await i18n.t('roles.DELETE_SUCCESS') };
  }

  async assignRole(assignRoleDto: AssignRoleDto, i18n: I18nContext) {
    if (!this.userRoles[assignRoleDto.userId]) {
      this.userRoles[assignRoleDto.userId] = [];
    }
    this.userRoles[assignRoleDto.userId].push(assignRoleDto.roleId);
    this.logger.info('Role assigned', assignRoleDto);
    return { message: await i18n.t('roles.ASSIGN_SUCCESS') };
  }
}
