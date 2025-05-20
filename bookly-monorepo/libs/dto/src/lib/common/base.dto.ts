import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO base con campos compartidos entre todos los DTOs
 */
export class BaseDto {
  @IsUUID(4, { message: 'ID debe ser un UUID vu00e1lido' })
  @IsOptional()
  id?: string;

  @IsDate({ message: 'createdAt debe ser una fecha vu00e1lida' })
  @IsOptional()
  createdAt?: Date;

  @IsDate({ message: 'updatedAt debe ser una fecha vu00e1lida' })
  @IsOptional()
  updatedAt?: Date;
}

/**
 * DTO base para todas las respuestas paginadas
 */
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO para solicitudes de paginaciu00f3n
 */
export class PaginationDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString({ each: true })
  sort?: string[];

  @IsOptional()
  @IsString()
  search?: string;
}
