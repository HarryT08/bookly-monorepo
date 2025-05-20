import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseDto } from '../common/base.dto';

/**
 * Estado de las reservas
 */
export enum ReservationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

/**
 * DTO para crear una reserva
 */
export class CreateReservationDto {
  @IsNotEmpty({ message: 'El ID del recurso es requerido' })
  @IsUUID(4, { message: 'El ID del recurso debe ser un UUID válido' })
  resourceId: string;

  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsUUID(4, { message: 'El ID del usuario debe ser un UUID válido' })
  userId: string;

  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido' })
  startTime: string;

  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido' })
  endTime: string;

  @IsOptional()
  @IsString({ message: 'El propósito debe ser una cadena de texto' })
  purpose?: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;

  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'El estado debe ser uno de los estados válidos' })
  status?: ReservationStatus = ReservationStatus.PENDING;
}

/**
 * DTO para actualizar una reserva
 */
export class UpdateReservationDto {
  @IsOptional()
  @IsUUID(4, { message: 'El ID del recurso debe ser un UUID válido' })
  resourceId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'El ID del usuario debe ser un UUID válido' })
  userId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido' })
  endTime?: string;

  @IsOptional()
  @IsString({ message: 'El propósito debe ser una cadena de texto' })
  purpose?: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;

  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'El estado debe ser uno de los estados válidos' })
  status?: ReservationStatus;
}

/**
 * DTO para respuesta con información de reserva
 */
export class ReservationResponseDto extends BaseDto {
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  notes?: string;
  status: ReservationStatus;
  approvedBy?: string;
  approvedAt?: Date;
}
