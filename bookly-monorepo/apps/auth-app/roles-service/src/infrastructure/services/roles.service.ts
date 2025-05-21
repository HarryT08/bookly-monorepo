import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { CreateRoleDto, UpdateRoleDto } from '@bookly-monorepo/dto';
import { RoleMapper } from '../../domain/dtos/role.dto';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { RoleEventsPublisher } from '../event-publishers/role-events.publisher';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @Inject('RoleRepository') private readonly roleRepository: RoleRepository,
    private readonly roleEventsPublisher: RoleEventsPublisher,
    private readonly i18n: I18nService
  ) {}

  async findAll() {
    this.logger.log('Finding all roles');
    const roles = await this.roleRepository.findAll();
    return RoleMapper.toDtoList(roles);
  }

  async findById(id: string) {
    this.logger.log(`Finding role by ID: ${id}`);
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(this.i18n.translate('ROLES.NOT_FOUND'));
    }
    return RoleMapper.toDto(role);
  }

  async findByName(name: string) {
    this.logger.log(`Finding role by name: ${name}`);
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundException(this.i18n.translate('ROLES.NOT_FOUND'));
    }
    return RoleMapper.toDto(role);
  }

  async create(createRoleDto: CreateRoleDto) {
    this.logger.log(`Creating new role: ${createRoleDto.name}`);
    // Usar directamente el DTO y convertirlo al formato esperado por el repositorio
    const savedRole = await this.roleRepository.create(createRoleDto as unknown as Role);

    // Publicar evento de creación de rol usando el publicador específico
    await this.roleEventsPublisher.publishRoleCreated(savedRole);

    return RoleMapper.toDto(savedRole);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    this.logger.log(`Updating role with ID: ${id}`);
    // Verificamos primero que exista (lanzará excepción si no existe)
    await this.findById(id);
    
    const updatedRole = await this.roleRepository.update(id, updateRoleDto);

    // Publicar evento de actualización de rol usando el publicador específico
    await this.roleEventsPublisher.publishRoleUpdated(updatedRole, updateRoleDto);

    return RoleMapper.toDto(updatedRole);
  }

  async remove(id: string) {
    this.logger.log(`Removing role with ID: ${id}`);
    // Verificamos primero que exista (lanzará excepción si no existe)
    await this.findById(id);
    await this.roleRepository.delete(id);

    // Publicar evento de eliminación de rol usando el publicador específico
    await this.roleEventsPublisher.publishRoleDeleted(id);

    return { id, message: this.i18n.translate('ROLES.DELETE_SUCCESS') };
  }

  async addPermission(roleId: string, permission: string) {
    this.logger.log(`Adding permission ${permission} to role ${roleId}`);
    
    // Verificar que el rol existe
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException(this.i18n.translate('ROLES.NOT_FOUND'));
    }
    
    // Verificar si el permiso ya existe en el rol
    if (role.permissions.includes(permission)) {
      return RoleMapper.toDto(role); // El permiso ya está asignado
    }
    
    // Añadir el permiso al rol
    role.permissions.push(permission);
    const updatedRole = await this.roleRepository.update(roleId, { permissions: role.permissions });
    
    // Publicar evento de permiso añadido
    await this.roleEventsPublisher.publishPermissionAdded(updatedRole, permission);
    
    return RoleMapper.toDto(updatedRole);
  }

  async removePermission(roleId: string, permission: string) {
    this.logger.log(`Removing permission ${permission} from role ${roleId}`);
    
    // Verificar que el rol existe
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException(this.i18n.translate('ROLES.NOT_FOUND'));
    }
    
    // Verificar si el permiso existe en el rol
    const permissionIndex = role.permissions.indexOf(permission);
    if (permissionIndex === -1) {
      return RoleMapper.toDto(role); // El permiso no está asignado
    }
    
    // Eliminar el permiso del rol
    role.permissions.splice(permissionIndex, 1);
    const updatedRole = await this.roleRepository.update(roleId, { permissions: role.permissions });
    
    // Publicar evento de permiso eliminado
    await this.roleEventsPublisher.publishPermissionRemoved(updatedRole, permission);
    
    return RoleMapper.toDto(updatedRole);
  }

  // Método para asignar un rol a un usuario (comunicación entre servicios)
  async assignRoleToUser(userId: string, roleId: string) {
    this.logger.log(`Assigning role ${roleId} to user ${userId}`);
    // Verificamos que el rol existe
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException(this.i18n.translate('ROLES.NOT_FOUND'));
    }
    
    // Opcional: si el repositorio tiene la implementación del método assignToUser
    await this.roleRepository.assignToUser(userId, roleId);

    // Publicar evento de asignación utilizando el publicador específico
    // Note: no tenemos un evento específico para asignación de roles, pero podemos agregar uno si es necesario
    await this.roleEventsPublisher.publishRoleUpdated(role, {
      _assignedToUserId: userId // Podemos añadir metadatos adicionales
    });

    return { message: this.i18n.translate('ROLES.ASSIGN_SUCCESS') };
  }
}
