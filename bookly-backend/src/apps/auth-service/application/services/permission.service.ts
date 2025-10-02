import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { Permission } from '../../domain/entities/user.entity';
import { PermissionEntity } from '../../domain/entities/permission.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async createPermission(data: {
    name: string;
    resource: string;
    action: string;
    scope?: string;
    description?: string;
    conditions?: any;
  }, createdBy?: string): Promise<Permission> {
    try {
      // Validate permission data
      const permission = PermissionEntity.create(
        data.name,
        data.resource,
        data.action,
        data.scope,
        data.description,
        data.conditions,
        createdBy,
      );

      if (!permission.isValid()) {
        throw new BadRequestException('Invalid permission data');
      }

      // Check if permission already exists
      const existing = await this.permissionRepository.findByName(data.name);
      if (existing) {
        throw new ConflictException(`Permission with name '${data.name}' already exists`);
      }

      const created = await this.permissionRepository.create(permission);

      this.loggingService.log('Permission created successfully', {
        permissionId: created.id,
        name: created.name,
        resource: created.resource,
        action: created.action,
        scope: created.scope,
      });

      return created;
    } catch (error) {
      this.loggingService.error('Failed to create permission', error, LoggingHelper.logParams({
        name: data.name,
        resource: data.resource,
        action: data.action,
      }));
      throw error;
    }
  }

  async findPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }
    return permission;
  }

  async findPermissionByName(name: string): Promise<Permission> {
    const permission = await this.permissionRepository.findByName(name);
    if (!permission) {
      throw new NotFoundException(`Permission with name '${name}' not found`);
    }
    return permission;
  }

  async findAllPermissions(filters?: {
    resource?: string;
    action?: string;
    scope?: string;
    isActive?: boolean;
  }): Promise<Permission[]> {
    return this.permissionRepository.findAll(filters);
  }

  async findActivePermissions(): Promise<Permission[]> {
    return this.permissionRepository.findActivePermissions();
  }

  async findPermissionsByResource(resource: string, action?: string, scope?: string): Promise<Permission[]> {
    return this.permissionRepository.findByResourceAndAction(resource, action, scope);
  }

  async updatePermission(id: string, data: Partial<Permission>, updatedBy?: string): Promise<Permission> {
    try {
      // Check if permission exists
      const existing = await this.findPermissionById(id);

      // If name is being changed, check for conflicts
      if (data.name && data.name !== existing.name) {
        const nameExists = await this.permissionRepository.findByName(data.name);
        if (nameExists) {
          throw new ConflictException(`Permission with name '${data.name}' already exists`);
        }
      }

      const updated = await this.permissionRepository.update(id, data);

      this.loggingService.log('Permission updated successfully', {
        permissionId: id,
        changes: data,
      });

      return updated;
    } catch (error) {
      this.loggingService.error('Failed to update permission', error, LoggingHelper.logParams({
        permissionId: id,
        changes: data,
      }));
      throw error;
    }
  }

  async deletePermission(id: string, deletedBy?: string): Promise<void> {
    try {
      // Check if permission exists
      await this.findPermissionById(id);

      await this.permissionRepository.delete(id);

      this.loggingService.log('Permission deleted successfully', {
        permissionId: id,
        deletedBy,
      });
    } catch (error) {
      this.loggingService.error('Failed to delete permission', error, LoggingHelper.logParams({
        permissionId: id,
      }));
      throw error;
    }
  }

  async deactivatePermission(id: string): Promise<Permission> {
    return this.updatePermission(id, { isActive: false });
  }

  async activatePermission(id: string): Promise<Permission> {
    return this.updatePermission(id, { isActive: true });
  }

  /**
   * Create default permissions for the system
   */
  async createDefaultPermissions(): Promise<Permission[]> {
    const defaultPermissions = this.getDefaultPermissions();
    
    try {
      const created = await this.permissionRepository.createMany(defaultPermissions);
      
      this.loggingService.log('Default permissions created successfully', LoggingHelper.logParams({
        permissions: created.map(p => p.name).join(', '),
      }));
      
      return created;
    } catch (error) {
      this.loggingService.error('Failed to create default permissions', error, LoggingHelper.logParams({
        permissions: defaultPermissions.map(p => p.name).join(', '),
      }));
      throw error;
    }
  }

  /**
   * Get default permissions for the system
   */
  private getDefaultPermissions(): Permission[] {
    const permissions: Permission[] = [];
    const resources = ['users', 'roles', 'permissions', 'resources', 'reservations', 'reports'];
    const actions = ['create', 'read', 'update', 'delete', 'approve', 'reject'];
    const scopes = ['own', 'program', 'global'];

    resources.forEach(resource => {
      actions.forEach(action => {
        scopes.forEach(scope => {
          // Skip some invalid combinations
          if ((action === 'approve' || action === 'reject') && resource !== 'reservations') {
            return;
          }

          const name = PermissionEntity.generateName(resource, action, scope);
          const description = `${action} ${resource} with ${scope} scope`;

          permissions.push(PermissionEntity.create(name, resource, action, scope, description));
        });
      });
    });

    return permissions;
  }

  /**
   * Check if a user has a specific permission
   */
  async checkPermission(
    userPermissions: Permission[],
    resource: string,
    action: string,
    scope: string = 'global'
  ): Promise<boolean> {
    return userPermissions.some(permission =>
      permission.resource === resource &&
      permission.action === action &&
      permission.scope === scope &&
      permission.isActive
    );
  }

  /**
   * Get the most restrictive permission for a resource and action
   */
  async getMostRestrictivePermission(
    userPermissions: Permission[],
    resource: string,
    action: string
  ): Promise<Permission | null> {
    const resourcePermissions = userPermissions.filter(p =>
      p.resource === resource &&
      p.action === action &&
      p.isActive
    );

    if (resourcePermissions.length === 0) {
      return null;
    }

    // Sort by scope restrictiveness: own < program < global
    const scopeOrder = { own: 0, program: 1, global: 2 };
    resourcePermissions.sort((a, b) => scopeOrder[a.scope] - scopeOrder[b.scope]);

    return resourcePermissions[0];
  }
}
