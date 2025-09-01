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

export enum ScheduledMaintenanceType {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
  EMERGENCIA = 'EMERGENCIA',
  LIMPIEZA = 'LIMPIEZA'
}

export enum ScheduledMaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ScheduledMaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}

export enum RecurringPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export class CreateScheduledMaintenanceDto {
  @ApiProperty({ description: 'ID del recurso a mantener' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ 
    description: 'Tipo de mantenimiento',
    enum: ScheduledMaintenanceType,
    example: ScheduledMaintenanceType.PREVENTIVO
  })
  @IsEnum(ScheduledMaintenanceType)
  maintenanceType: ScheduledMaintenanceType;

  @ApiProperty({ description: 'Título del mantenimiento programado', example: 'Mantenimiento preventivo del proyector' })
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

  @ApiProperty({ description: 'Fecha y hora programada para el mantenimiento' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Duración estimada en minutos', example: 120 })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @ApiProperty({ 
    description: 'Prioridad del mantenimiento',
    enum: ScheduledMaintenancePriority,
    example: ScheduledMaintenancePriority.MEDIUM
  })
  @IsEnum(ScheduledMaintenancePriority)
  priority: ScheduledMaintenancePriority;

  @ApiPropertyOptional({ description: 'ID del técnico asignado' })
  @IsOptional()
  @IsString()
  assignedTechnician?: string;

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
    description: 'Requerimientos (herramientas, materiales, etc.)',
    type: [String],
    example: ['Destornillador Phillips', 'Paño de microfibra', 'Solución limpiadora']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ description: 'Es un mantenimiento recurrente', default: false })
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

  @ApiPropertyOptional({ description: 'Fecha límite para mantenimientos recurrentes' })
  @IsOptional()
  @IsDateString()
  recurringEndDate?: string;

  @ApiPropertyOptional({ description: 'ID del programa padre para mantenimientos recurrentes' })
  @IsOptional()
  @IsString()
  parentScheduleId?: string;

  @ApiPropertyOptional({ description: 'Requiere aprobación antes de ejecutar', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  approvalRequired?: boolean;

  @ApiPropertyOptional({ 
    description: 'Etiquetas para categorización',
    type: [String],
    example: ['crítico', 'infraestructura']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateScheduledMaintenanceDto {
  @ApiPropertyOptional({ description: 'Título del mantenimiento' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción del mantenimiento' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ description: 'Fecha programada' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Duración estimada en minutos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Prioridad',
    enum: ScheduledMaintenancePriority
  })
  @IsOptional()
  @IsEnum(ScheduledMaintenancePriority)
  priority?: ScheduledMaintenancePriority;

  @ApiPropertyOptional({ 
    description: 'Estado',
    enum: ScheduledMaintenanceStatus
  })
  @IsOptional()
  @IsEnum(ScheduledMaintenanceStatus)
  status?: ScheduledMaintenanceStatus;

  @ApiPropertyOptional({ description: 'Técnico asignado' })
  @IsOptional()
  @IsString()
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Costo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Notas' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Requerimientos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ description: 'Duración real en minutos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Notas de finalización' })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiPropertyOptional({ 
    description: 'Calificación de calidad',
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'Archivos adjuntos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'ID del registro de mantenimiento asociado' })
  @IsOptional()
  @IsString()
  maintenanceRecordId?: string;

  @ApiPropertyOptional({ description: 'Etiquetas', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ScheduledMaintenanceFiltersDto {
  @ApiPropertyOptional({ description: 'ID del recurso' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de mantenimiento',
    enum: ScheduledMaintenanceType
  })
  @IsOptional()
  @IsEnum(ScheduledMaintenanceType)
  maintenanceType?: ScheduledMaintenanceType;

  @ApiPropertyOptional({ 
    description: 'Prioridad',
    enum: ScheduledMaintenancePriority
  })
  @IsOptional()
  @IsEnum(ScheduledMaintenancePriority)
  priority?: ScheduledMaintenancePriority;

  @ApiPropertyOptional({ 
    description: 'Estado',
    enum: ScheduledMaintenanceStatus
  })
  @IsOptional()
  @IsEnum(ScheduledMaintenanceStatus)
  status?: ScheduledMaintenanceStatus;

  @ApiPropertyOptional({ description: 'Técnico asignado' })
  @IsOptional()
  @IsString()
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Solo mantenimientos recurrentes' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean;

  @ApiPropertyOptional({ 
    description: 'Patrón de recurrencia',
    enum: RecurringPattern
  })
  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ description: 'Fecha programada desde' })
  @IsOptional()
  @IsDateString()
  scheduledDateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha programada hasta' })
  @IsOptional()
  @IsDateString()
  scheduledDateTo?: string;

  @ApiPropertyOptional({ description: 'Solo mantenimientos vencidos' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isOverdue?: boolean;

  @ApiPropertyOptional({ description: 'Solo mantenimientos próximos a vencer' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isDue?: boolean;

  @ApiPropertyOptional({ description: 'Solo mantenimientos que requieren aprobación' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  needsApproval?: boolean;

  @ApiPropertyOptional({ description: 'Solo mantenimientos aprobados' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isApproved?: boolean;

  @ApiPropertyOptional({ description: 'ID del programa padre' })
  @IsOptional()
  @IsString()
  parentScheduleId?: string;

  @ApiPropertyOptional({ description: 'Etiquetas', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Creado por usuario' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class AssignTechnicianDto {
  @ApiProperty({ description: 'ID del técnico a asignar' })
  @IsString()
  @IsNotEmpty()
  technicianId: string;
}

export class RescheduleMaintenanceDto {
  @ApiProperty({ description: 'Nueva fecha programada' })
  @IsDateString()
  newScheduledDate: string;

  @ApiPropertyOptional({ description: 'Razón de la reprogramación' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class PostponeMaintenanceDto {
  @ApiProperty({ description: 'Nueva fecha de programación' })
  @IsDateString()
  postponedTo: string;

  @ApiProperty({ description: 'Razón del aplazamiento' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CancelMaintenanceDto {
  @ApiProperty({ description: 'Razón de la cancelación' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CompleteMaintenanceDto {
  @ApiProperty({ description: 'Duración real en minutos', example: 90 })
  @IsNumber()
  @Min(1)
  actualDuration: number;

  @ApiPropertyOptional({ description: 'Notas de finalización' })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiPropertyOptional({ 
    description: 'Calificación de calidad',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'ID del registro de mantenimiento asociado' })
  @IsOptional()
  @IsString()
  maintenanceRecordId?: string;
}

export class AddRequirementDto {
  @ApiProperty({ description: 'Requerimiento a agregar' })
  @IsString()
  @IsNotEmpty()
  requirement: string;
}

export class GenerateRecurringSchedulesDto {
  @ApiProperty({ description: 'ID del programa base' })
  @IsString()
  @IsNotEmpty()
  baseScheduleId: string;

  @ApiProperty({ 
    description: 'Número de ocurrencias a generar',
    minimum: 1,
    maximum: 100,
    example: 12
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  occurrences: number;
}

export class BulkRescheduleDto {
  @ApiProperty({ 
    description: 'IDs de mantenimientos a reprogramar',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  scheduleIds: string[];

  @ApiProperty({ 
    description: 'Nuevas fechas (debe coincidir con la cantidad de IDs)',
    type: [String]
  })
  @IsArray()
  @IsDateString()
  newDates: string[];

  @ApiPropertyOptional({ description: 'Razón de la reprogramación masiva' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkApproveDto {
  @ApiProperty({ 
    description: 'IDs de mantenimientos a aprobar',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  scheduleIds: string[];

  @ApiPropertyOptional({ description: 'Comentarios de aprobación' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class CheckConflictsDto {
  @ApiProperty({ description: 'ID del recurso' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'Fecha programada' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Duración en minutos' })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiPropertyOptional({ description: 'ID del programa a excluir de la verificación' })
  @IsOptional()
  @IsString()
  excludeScheduleId?: string;
}

export class FindTimeSlotsDto {
  @ApiProperty({ description: 'ID del recurso' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'Fecha de inicio del rango' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Fecha de fin del rango' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Duración requerida en minutos' })
  @IsNumber()
  @Min(1)
  durationMinutes: number;
}

export class ScheduledMaintenanceResponseDto {
  @ApiProperty({ description: 'ID único del programa' })
  id: string;

  @ApiProperty({ description: 'ID del recurso' })
  resourceId: string;

  @ApiProperty({ description: 'Tipo de mantenimiento', enum: ScheduledMaintenanceType })
  maintenanceType: ScheduledMaintenanceType;

  @ApiProperty({ description: 'Título' })
  title: string;

  @ApiProperty({ description: 'Descripción' })
  description: string;

  @ApiProperty({ description: 'Fecha programada' })
  scheduledDate: Date;

  @ApiProperty({ description: 'Duración estimada en minutos' })
  estimatedDuration: number;

  @ApiProperty({ description: 'Prioridad', enum: ScheduledMaintenancePriority })
  priority: ScheduledMaintenancePriority;

  @ApiProperty({ description: 'Estado', enum: ScheduledMaintenanceStatus })
  status: ScheduledMaintenanceStatus;

  @ApiPropertyOptional({ description: 'Técnico asignado' })
  assignedTechnician?: string;

  @ApiPropertyOptional({ description: 'Costo estimado' })
  cost?: number;

  @ApiPropertyOptional({ description: 'Notas' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Requerimientos', type: [String] })
  requirements?: string[];

  @ApiProperty({ description: 'Es recurrente' })
  isRecurring: boolean;

  @ApiPropertyOptional({ description: 'Patrón de recurrencia', enum: RecurringPattern })
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ description: 'Fecha límite de recurrencia' })
  recurringEndDate?: Date;

  @ApiPropertyOptional({ description: 'ID del programa padre' })
  parentScheduleId?: string;

  @ApiPropertyOptional({ description: 'Próxima fecha programada' })
  nextScheduledDate?: Date;

  @ApiProperty({ description: 'Recordatorio enviado' })
  reminderSent: boolean;

  @ApiPropertyOptional({ description: 'Fecha del recordatorio' })
  reminderDate?: Date;

  @ApiProperty({ description: 'Requiere aprobación' })
  approvalRequired: boolean;

  @ApiPropertyOptional({ description: 'Aprobado por' })
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'Fecha de aprobación' })
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'Fecha de finalización' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Finalizado por' })
  completedBy?: string;

  @ApiPropertyOptional({ description: 'Duración real en minutos' })
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Notas de finalización' })
  completionNotes?: string;

  @ApiPropertyOptional({ description: 'Calificación de calidad' })
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'Archivos adjuntos', type: [String] })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'ID del registro de mantenimiento' })
  maintenanceRecordId?: string;

  @ApiPropertyOptional({ description: 'Razón de aplazamiento' })
  postponedReason?: string;

  @ApiPropertyOptional({ description: 'Aplazado hasta' })
  postponedTo?: Date;

  @ApiPropertyOptional({ description: 'Razón de cancelación' })
  cancellationReason?: string;

  @ApiPropertyOptional({ description: 'Etiquetas', type: [String] })
  tags?: string[];

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiProperty({ description: 'Creado por' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Actualizado por' })
  updatedBy?: string;
}

export class ScheduledMaintenanceListResponseDto {
  @ApiProperty({ description: 'Lista de mantenimientos programados', type: [ScheduledMaintenanceResponseDto] })
  schedules: ScheduledMaintenanceResponseDto[];

  @ApiProperty({ description: 'Total de registros' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}

export class ScheduledMaintenanceStatisticsDto {
  @ApiProperty({ description: 'Total de programas' })
  totalSchedules: number;

  @ApiProperty({ description: 'Mantenimientos programados' })
  scheduledMaintenance: number;

  @ApiProperty({ description: 'Mantenimientos en progreso' })
  inProgressMaintenance: number;

  @ApiProperty({ description: 'Mantenimientos completados' })
  completedMaintenance: number;

  @ApiProperty({ description: 'Mantenimientos cancelados' })
  cancelledMaintenance: number;

  @ApiProperty({ description: 'Mantenimientos aplazados' })
  postponedMaintenance: number;

  @ApiProperty({ description: 'Mantenimientos vencidos' })
  overdueMaintenance: number;

  @ApiProperty({ description: 'Pendientes de aprobación' })
  pendingApproval: number;

  @ApiProperty({ description: 'Tiempo promedio de ejecución en minutos' })
  averageExecutionTime: number;

  @ApiProperty({ description: 'Tasa de completitud en porcentaje' })
  completionRate: number;

  @ApiPropertyOptional({ description: 'Costo total' })
  totalCost?: number;

  @ApiProperty({ description: 'Programas recurrentes' })
  recurringSchedules: number;

  @ApiProperty({ description: 'Distribución por tipo de mantenimiento' })
  byMaintenanceType: Record<string, number>;

  @ApiProperty({ description: 'Distribución por prioridad' })
  byPriority: Record<string, number>;

  @ApiProperty({ description: 'Distribución por estado' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Próximos esta semana' })
  upcomingThisWeek: number;

  @ApiProperty({ description: 'Próximos este mes' })
  upcomingThisMonth: number;
}

export class TimeSlotResponseDto {
  @ApiProperty({ description: 'Fecha y hora de inicio' })
  start: Date;

  @ApiProperty({ description: 'Fecha y hora de fin' })
  end: Date;
}

export class ConflictResponseDto {
  @ApiProperty({ description: 'Hay conflictos' })
  hasConflicts: boolean;

  @ApiProperty({ description: 'Mantenimientos en conflicto', type: [ScheduledMaintenanceResponseDto] })
  conflicts: ScheduledMaintenanceResponseDto[];
}

export class RecurringScheduleSummaryDto {
  @ApiProperty({ description: 'ID del programa padre' })
  parentScheduleId: string;

  @ApiProperty({ description: 'ID del recurso' })
  resourceId: string;

  @ApiProperty({ description: 'Tipo de mantenimiento' })
  maintenanceType: string;

  @ApiProperty({ description: 'Patrón de recurrencia' })
  recurringPattern: string;

  @ApiProperty({ description: 'Próxima fecha programada' })
  nextScheduled: Date;

  @ApiProperty({ description: 'Total de ocurrencias' })
  totalOccurrences: number;

  @ApiProperty({ description: 'Ocurrencias completadas' })
  completedOccurrences: number;
}
