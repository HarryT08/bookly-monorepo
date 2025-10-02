import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsDateString, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsBoolean,
  IsEnum,
  Min,
  Max,
  ValidateNested,
  IsUrl
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum MaintenanceType {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
  EMERGENCIA = 'EMERGENCIA',
  LIMPIEZA = 'LIMPIEZA'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RecurringPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export class CreateMaintenanceRecordDto {
  @ApiProperty({ description: 'ID del recurso a mantener' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'ID del usuario que solicita el mantenimiento' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Tipo de mantenimiento',
    enum: MaintenanceType,
    example: MaintenanceType.PREVENTIVO
  })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @ApiProperty({ description: 'Título del mantenimiento', example: 'Mantenimiento preventivo del proyector' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Descripción detallada del mantenimiento',
    example: 'Limpieza de filtros, calibración de lente y verificación de conexiones'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'Prioridad del mantenimiento',
    enum: MaintenancePriority,
    example: MaintenancePriority.MEDIUM
  })
  @IsEnum(MaintenancePriority)
  priority: MaintenancePriority;

  @ApiProperty({ description: 'Fecha programada para el mantenimiento' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Duración estimada en minutos', example: 120 })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @ApiPropertyOptional({ description: 'Costo estimado del mantenimiento', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'URLs de archivos adjuntos',
    type: [String],
    example: ['https://example.com/manual.pdf']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'ID del técnico asignado' })
  @IsOptional()
  @IsString()
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Indica si es un mantenimiento recurrente', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean;

  @ApiPropertyOptional({ 
    description: 'Patrón de recurrencia',
    enum: RecurringPattern,
    example: RecurringPattern.MONTHLY
  })
  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ description: 'ID del registro padre para mantenimientos recurrentes' })
  @IsOptional()
  @IsString()
  parentRecordId?: string;

  @ApiPropertyOptional({ 
    description: 'Requiere seguimiento posterior',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de seguimiento' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}

export class UpdateMaintenanceRecordDto {
  @ApiPropertyOptional({ description: 'Título del mantenimiento' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción detallada del mantenimiento' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Prioridad del mantenimiento',
    enum: MaintenancePriority
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({ 
    description: 'Estado del mantenimiento',
    enum: MaintenanceStatus
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ description: 'Fecha programada para el mantenimiento' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio real' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de finalización real' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Duración estimada en minutos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Costo del mantenimiento' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'URLs de archivos adjuntos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'ID del técnico asignado' })
  @IsOptional()
  @IsString()
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Notas del técnico' })
  @IsOptional()
  @IsString()
  technicianNotes?: string;

  @ApiPropertyOptional({ 
    description: 'Porcentaje de completitud',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @ApiPropertyOptional({ 
    description: 'Calificación de calidad del mantenimiento',
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'Requiere seguimiento posterior' })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de seguimiento' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}

export class MaintenanceRecordFiltersDto {
  @ApiPropertyOptional({ description: 'ID del recurso' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'ID del usuario' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de mantenimiento',
    enum: MaintenanceType
  })
  @IsOptional()
  @IsEnum(MaintenanceType)
  maintenanceType?: MaintenanceType;

  @ApiPropertyOptional({ 
    description: 'Prioridad',
    enum: MaintenancePriority
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({ 
    description: 'Estado',
    enum: MaintenanceStatus
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ description: 'ID del técnico asignado' })
  @IsOptional()
  @IsString()
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Filtrar solo mantenimientos recurrentes' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de programación desde' })
  @IsOptional()
  @IsDateString()
  scheduledDateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha de programación hasta' })
  @IsOptional()
  @IsDateString()
  scheduledDateTo?: string;

  @ApiPropertyOptional({ description: 'Filtrar solo mantenimientos vencidos' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isOverdue?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar solo mantenimientos que requieren seguimiento' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Creado por usuario' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class MaintenanceRecordSortDto {
  @ApiPropertyOptional({ 
    description: 'Campo por el cual ordenar',
    example: 'scheduledDate',
    default: 'scheduledDate'
  })
  @IsOptional()
  @IsString()
  field?: string = 'scheduledDate';

  @ApiPropertyOptional({ 
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc'
  })
  @IsOptional()
  @IsString()
  direction?: 'asc' | 'desc' = 'asc';
}

export class MaintenanceRecordPaginationDto {
  @ApiPropertyOptional({ 
    description: 'Número de página',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Elementos por página',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class AssignTechnicianDto {
  @ApiProperty({ description: 'ID del técnico a asignar' })
  @IsString()
  @IsNotEmpty()
  technicianId: string;
}

export class UpdateProgressDto {
  @ApiProperty({ 
    description: 'Porcentaje de completitud',
    minimum: 0,
    maximum: 100,
    example: 75
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @ApiPropertyOptional({ description: 'Notas del progreso' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddTechnicianNotesDto {
  @ApiProperty({ description: 'Notas técnicas del mantenimiento' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}

export class SetQualityRatingDto {
  @ApiProperty({ 
    description: 'Calificación de calidad',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Comentarios sobre la calificación' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class ScheduleFollowUpDto {
  @ApiProperty({ description: 'Fecha del seguimiento' })
  @IsDateString()
  followUpDate: string;

  @ApiPropertyOptional({ description: 'Notas del seguimiento' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RescheduleDto {
  @ApiProperty({ description: 'Nueva fecha programada' })
  @IsDateString()
  newScheduledDate: string;

  @ApiPropertyOptional({ description: 'Razón de la reprogramación' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ScheduleRecurringMaintenanceDto {
  @ApiProperty({ description: 'ID del registro base para recurrencia' })
  @IsString()
  @IsNotEmpty()
  baseRecordId: string;

  @ApiProperty({ 
    description: 'Número de ocurrencias a programar',
    minimum: 1,
    maximum: 52,
    example: 12
  })
  @IsNumber()
  @Min(1)
  @Max(52)
  occurrences: number;
}

export class MaintenanceRecordResponseDto {
  @ApiProperty({ description: 'ID único del registro' })
  id: string;

  @ApiProperty({ description: 'ID del recurso' })
  resourceId: string;

  @ApiProperty({ description: 'ID del usuario' })
  userId: string;

  @ApiProperty({ description: 'Tipo de mantenimiento', enum: MaintenanceType })
  maintenanceType: MaintenanceType;

  @ApiProperty({ description: 'Título del mantenimiento' })
  title: string;

  @ApiProperty({ description: 'Descripción del mantenimiento' })
  description: string;

  @ApiProperty({ description: 'Prioridad', enum: MaintenancePriority })
  priority: MaintenancePriority;

  @ApiProperty({ description: 'Estado actual', enum: MaintenanceStatus })
  status: MaintenanceStatus;

  @ApiProperty({ description: 'Fecha programada' })
  scheduledDate: Date;

  @ApiPropertyOptional({ description: 'Fecha de inicio real' })
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Fecha de finalización real' })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Duración real en minutos' })
  actualDuration?: number;

  @ApiProperty({ description: 'Duración estimada en minutos' })
  estimatedDuration: number;

  @ApiPropertyOptional({ description: 'Costo del mantenimiento' })
  cost?: number;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Archivos adjuntos', type: [String] })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Técnico asignado' })
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Notas del técnico' })
  technicianNotes?: string;

  @ApiProperty({ description: 'Es recurrente' })
  isRecurring: boolean;

  @ApiPropertyOptional({ description: 'Patrón de recurrencia', enum: RecurringPattern })
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ description: 'Próxima fecha programada' })
  nextScheduledDate?: Date;

  @ApiPropertyOptional({ description: 'ID del registro padre' })
  parentRecordId?: string;

  @ApiProperty({ description: 'Porcentaje de completitud' })
  completionPercentage: number;

  @ApiPropertyOptional({ description: 'Calificación de calidad' })
  qualityRating?: number;

  @ApiProperty({ description: 'Requiere seguimiento' })
  followUpRequired: boolean;

  @ApiPropertyOptional({ description: 'Fecha de seguimiento' })
  followUpDate?: Date;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiProperty({ description: 'Creado por' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Actualizado por' })
  updatedBy?: string;
}

export class MaintenanceRecordListResponseDto {
  @ApiProperty({ description: 'Lista de registros de mantenimiento', type: [MaintenanceRecordResponseDto] })
  records: MaintenanceRecordResponseDto[];

  @ApiProperty({ description: 'Total de registros' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}

export class MaintenanceRecordStatisticsDto {
  @ApiProperty({ description: 'Total de registros' })
  totalRecords: number;

  @ApiProperty({ description: 'Registros pendientes' })
  pendingRecords: number;

  @ApiProperty({ description: 'Registros en progreso' })
  inProgressRecords: number;

  @ApiProperty({ description: 'Registros completados' })
  completedRecords: number;

  @ApiProperty({ description: 'Registros vencidos' })
  overdueRecords: number;

  @ApiProperty({ description: 'Tiempo promedio de completitud en minutos' })
  averageCompletionTime: number;

  @ApiProperty({ description: 'Tasa de completitud en porcentaje' })
  completionRate: number;

  @ApiPropertyOptional({ description: 'Calificación promedio de calidad' })
  qualityRatingAverage?: number;

  @ApiPropertyOptional({ description: 'Costo total' })
  costTotal?: number;

  @ApiProperty({ description: 'Distribución por tipo de mantenimiento' })
  byMaintenanceType: Record<string, number>;

  @ApiProperty({ description: 'Distribución por prioridad' })
  byPriority: Record<string, number>;

  @ApiProperty({ description: 'Distribución por estado' })
  byStatus: Record<string, number>;
}
