import { RoleResponseDto, IRole } from '@bookly-monorepo/dto';
import { Role } from '../entities/role.entity';

/**
 * Clase con mu00e9todos de mapeo entre la entidad Role de MongoDB y los DTOs/Interfaces
 */
export class RoleMapper {
  /**
   * Convierte una entidad de rol de MongoDB a la interfaz IRole
   */
  static toInterface(role: Role): IRole {
    return {
      id: role._id?.toString() ?? '',
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }

  /**
   * Convierte una entidad de rol de MongoDB al DTO de respuesta
   */
  static toDto(role: Role): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id = role._id?.toString() ?? '';
    dto.name = role.name;
    dto.description = role.description;
    dto.permissions = role.permissions || [];
    dto.createdAt = role.createdAt;
    dto.updatedAt = role.updatedAt;
    return dto;
  }

  /**
   * Convierte un array de entidades de rol a un array de DTOs
   */
  static toDtoList(roles: Role[]): RoleResponseDto[] {
    return roles.map(role => this.toDto(role));
  }
}
