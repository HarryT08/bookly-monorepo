import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BaseDto } from '../common/base.dto';

/**
 * Tipos de recursos disponibles en el sistema
 */
export enum ResourceType {
  ROOM = 'room',
  AUDITORIUM = 'auditorium',
  LABORATORY = 'laboratory',
  COMPUTER = 'computer',
  EQUIPMENT = 'equipment',
  OTHER = 'other'
}

/**
 * DTO para crear un recurso
 */
export class CreateResourceDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El tipo de recurso es requerido' })
  @IsEnum(ResourceType, { message: 'El tipo de recurso debe ser uno de los tipos vu00e1lidos' })
  type: ResourceType;

  @IsNotEmpty({ message: 'La ubicaciu00f3n es requerida' })
  @IsString({ message: 'La ubicaciu00f3n debe ser una cadena de texto' })
  location: string;

  @IsOptional()
  @IsString({ message: 'La descripciu00f3n debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un nu00famero' })
  capacity?: number;

  @IsOptional()
  @IsBoolean({ message: 'La disponibilidad debe ser un valor booleano' })
  isAvailable?: boolean = true;

  @IsOptional()
  @IsString({ each: true, message: 'Las amenidades deben ser cadenas de texto' })
  amenities?: string[];

  @IsOptional()
  @IsString({ message: 'El ID del responsable debe ser una cadena de texto' })
  responsibleId?: string;
}

/**
 * DTO para actualizar un recurso
 */
export class UpdateResourceDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsEnum(ResourceType, { message: 'El tipo de recurso debe ser uno de los tipos vu00e1lidos' })
  type?: ResourceType;

  @IsOptional()
  @IsString({ message: 'La ubicaciu00f3n debe ser una cadena de texto' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'La descripciu00f3n debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un nu00famero' })
  capacity?: number;

  @IsOptional()
  @IsBoolean({ message: 'La disponibilidad debe ser un valor booleano' })
  isAvailable?: boolean;

  @IsOptional()
  @IsString({ each: true, message: 'Las amenidades deben ser cadenas de texto' })
  amenities?: string[];

  @IsOptional()
  @IsString({ message: 'El ID del responsable debe ser una cadena de texto' })
  responsibleId?: string;
}

/**
 * DTO para respuesta con informaciu00f3n de recurso
 */
export class ResourceResponseDto extends BaseDto {
  name: string;
  type: ResourceType;
  location: string;
  description?: string;
  capacity?: number;
  isAvailable: boolean;
  amenities?: string[];
  responsibleId?: string;
}
