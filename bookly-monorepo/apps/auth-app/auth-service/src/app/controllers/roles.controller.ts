import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService, private readonly logger: Logger) {}

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto, @I18n() i18n: I18nContext) {
    this.logger.info('Create role', { name: createRoleDto.name });
    return this.rolesService.createRole(createRoleDto, i18n);
  }

  @Get()
  async getRoles(@I18n() i18n: I18nContext) {
    this.logger.info('Get all roles');
    return this.rolesService.getRoles(i18n);
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() createRoleDto: CreateRoleDto, @I18n() i18n: I18nContext) {
    this.logger.info('Update role', { id, name: createRoleDto.name });
    return this.rolesService.updateRole(id, createRoleDto, i18n);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string, @I18n() i18n: I18nContext) {
    this.logger.info('Delete role', { id });
    return this.rolesService.deleteRole(id, i18n);
  }

  @Post('assign')
  async assignRole(@Body() assignRoleDto: AssignRoleDto, @I18n() i18n: I18nContext) {
    this.logger.info('Assign role', assignRoleDto);
    return this.rolesService.assignRole(assignRoleDto, i18n);
  }
}
