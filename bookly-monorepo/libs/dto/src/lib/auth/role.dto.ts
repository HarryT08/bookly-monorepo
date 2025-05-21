import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '../common/base.dto';

/**
 * DTO para crear un rol
 */
export class CreateRoleDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripciu00f3n debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permissions?: string[];
}

/**
 * DTO para actualizar un rol
 */
export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripciu00f3n debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permissions?: string[];
}

/**
 * DTO para respuesta con informaciu00f3n de rol
 */
export class RoleResponseDto extends BaseDto {
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Interfaz de Role para comunicaciu00f3n entre servicios
 */
export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
