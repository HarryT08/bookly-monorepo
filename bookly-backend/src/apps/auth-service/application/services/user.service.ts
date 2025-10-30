import { Injectable } from '@nestjs/common';
import { UserRepository } from '@apps/auth-service/domain/repositories/user.repository';
import { RoleRepository } from '@apps/auth-service/domain/repositories/role.repository';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findByUsername(username);
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{
    users: UserEntity[];
    total: number;
  }> {
    return this.userRepository.findAll(page, limit, search);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.create(user);
  }

  async update(id: string, user: Partial<UserEntity>, updatedBy?: string): Promise<UserEntity> {
    // Add updatedBy field to the user data if provided
    const userData = updatedBy ? { ...user, updatedBy } : user;
    return this.userRepository.update(id, userData);
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    // Log deletion action with deletedBy information
    if (deletedBy) {
      this.loggingService.log(`User ${id} deleted by ${deletedBy}`, 'UserService');
    }
    return this.userRepository.delete(id);
  }

  async assignRole(userId: string, roleId: string, assignedBy?: string): Promise<void> {
    // Log assignment action with assignedBy information
    if (assignedBy) {
      this.loggingService.log(`Role ${roleId} assigned to user ${userId} by ${assignedBy}`, 'UserService');
    }
    return this.userRepository.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: string, removedBy?: string): Promise<void> {
    this.loggingService.log(`Removing role ${roleId} from user ${userId} by ${removedBy}`, 'UserService');
    return this.userRepository.removeRole(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRepository.findUserRoles(userId);
    return userRoles.map(ur => ur.role.name);
  }

  /**
   * Create a new user from SSO provider
   */
  async createSSOUser(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    ssoProvider: string;
    ssoId: string;
    isEmailVerified?: boolean;
  }): Promise<UserEntity> {
    try {
      const user = UserEntity.create(
        userData.email,
        userData.username,
        undefined, // No password for SSO users
        userData.firstName,
        userData.lastName,
      );

      // Set SSO specific fields
      user.ssoProvider = userData.ssoProvider;
      user.ssoId = userData.ssoId;
      user.isEmailVerified = userData.isEmailVerified || true;

      const createdUser = await this.userRepository.create(user);

      // Assign default role based on email domain or other criteria
      await this.assignDefaultRole(createdUser);

      this.loggingService.log('SSO user created successfully', 'UserService');

      return createdUser;
    } catch (error) {
      this.loggingService.error('Failed to create SSO user', error.stack, 'UserService');
      throw error;
    }
  }

  /**
   * Update SSO information for existing user
   */
  async updateSSOInfo(
    userId: string,
    ssoProvider: string,
    ssoId: string,
  ): Promise<void> {
    try {
      await this.userRepository.updateSSOInfo(userId, ssoProvider, ssoId);
      
      this.loggingService.log('SSO info updated for user', 'UserService');
    } catch (error) {
      this.loggingService.error('Failed to update SSO info', error.stack, 'UserService');
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(userId);
    } catch (error) {
      this.loggingService.error('Failed to update last login', error.stack, 'UserService');
      throw error;
    }
  }

  /**
   * Assign default role to new SSO user based on email domain or other criteria
   */
  private async assignDefaultRole(user: UserEntity): Promise<void> {
    try {
      // Default role assignment logic
      let defaultRoleName = 'Estudiante'; // Default role

      // Check email domain for institutional users
      if (user.email.endsWith('@ufps.edu.co')) {
        // Determine role based on email pattern or other criteria
        if (user.email.includes('docente') || user.email.includes('profesor')) {
          defaultRoleName = 'Docente';
        } else if (user.email.includes('admin')) {
          defaultRoleName = 'Administrador General';
        }
        // Students typically have numeric patterns in institutional emails
        // This logic can be customized based on UFPS email patterns
      }

      // Find and assign the default role
      const defaultRole = await this.roleRepository.findByName(defaultRoleName);
      if (defaultRole) {
        await this.userRepository.assignRole(user.id, defaultRole.id);
        
        this.loggingService.log('Default role assigned to SSO user', 'UserService');
      }
    } catch (error) {
      this.loggingService.error('Failed to assign default role to SSO user', error.stack, 'UserService');
      // Don't throw error here as user creation should succeed even if role assignment fails
    }
  }

  async findByIdWithRoles(id: string): Promise<UserEntity | null> {
    return this.userRepository.findByIdWithRoles(id);
  }
}
