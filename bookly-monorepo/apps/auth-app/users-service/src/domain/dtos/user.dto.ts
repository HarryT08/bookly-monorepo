import { UserResponseDto, IUser, UserRole } from '@bookly-monorepo/dto';
import { User } from '../entities/user.entity';

/**
 * Clase con mu00e9todos de mapeo entre la entidad User de MongoDB y los DTOs/Interfaces
 */
export class UserMapper {
  /**
   * Convierte una entidad de usuario de MongoDB a la interfaz IUser
   */
  static toInterface(user: User): IUser {
    return {
      id: user._id?.toString() || '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as UserRole,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Convierte una entidad de usuario de MongoDB al DTO de respuesta
   */
  static toDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user._id?.toString() || '';
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.role = user.role as UserRole;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  /**
   * Convierte un array de entidades de usuario a un array de DTOs
   */
  static toDtoList(users: User[]): UserResponseDto[] {
    return users.map(user => this.toDto(user));
  }
}
