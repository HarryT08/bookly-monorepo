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
  ValidateNested,
  IsUrl
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum IncidentType {
  DAMAGE = 'DAMAGE',
  MALFUNCTION = 'MALFUNCTION',
  SAFETY = 'SAFETY',
  THEFT = 'THEFT',
  VANDALISM = 'VANDALISM',
  OTHER = 'OTHER'
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IncidentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export class CreateIncidentReportDto {
  @ApiProperty({ description: 'ID del recurso afectado' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'ID del usuario que reporta el incidente' })
  @IsString()
  @IsNotEmpty()
  reportedBy: string;

  @ApiProperty({ 
    description: 'Tipo de incidente',
    enum: IncidentType,
    example: IncidentType.DAMAGE
  })
  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @ApiProperty({ 
    description: 'Severidad del incidente',
    enum: IncidentSeverity,
    example: IncidentSeverity.MEDIUM
  })
  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @ApiProperty({ 
    description: 'Prioridad del incidente',
    enum: IncidentPriority,
    example: IncidentPriority.HIGH
  })
  @IsEnum(IncidentPriority)
  priority: IncidentPriority;

  @ApiProperty({ description: 'Título del incidente', example: 'Proyector no enciende' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Descripción detallada del incidente',
    example: 'El proyector del aula 201 no enciende después de conectar el cable de alimentación'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Ubicación específica del incidente' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Fecha y hora cuando ocurrió el incidente' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ description: 'Fecha y hora cuando se descubrió el incidente' })
  @IsDateString()
  discoveredDate: string;

  @ApiPropertyOptional({ description: 'Número de usuarios afectados', example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  affectedUsers?: number;

  @ApiPropertyOptional({ description: 'Costo estimado del daño', example: 250000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ 
    description: 'URLs de archivos adjuntos (fotos, documentos)',
    type: [String],
    example: ['https://example.com/incident-photo.jpg']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ 
    description: 'IDs de usuarios testigos',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  witnesses?: string[];

  @ApiPropertyOptional({ 
    description: 'IDs de incidentes relacionados',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedIncidents?: string[];

  @ApiPropertyOptional({ description: 'Requiere mantenimiento correctivo', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  maintenanceRequired?: boolean;

  @ApiPropertyOptional({ description: 'Requiere seguimiento posterior', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de seguimiento' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Es un incidente recurrente', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Patrón de recurrencia si aplica' })
  @IsOptional()
  @IsString()
  recurringPattern?: string;

  @ApiPropertyOptional({ 
    description: 'Etiquetas para categorización',
    type: [String],
    example: ['urgente', 'infraestructura']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateIncidentReportDto {
  @ApiPropertyOptional({ description: 'Título del incidente' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción del incidente' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Severidad del incidente',
    enum: IncidentSeverity
  })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ 
    description: 'Prioridad del incidente',
    enum: IncidentPriority
  })
  @IsOptional()
  @IsEnum(IncidentPriority)
  priority?: IncidentPriority;

  @ApiPropertyOptional({ 
    description: 'Estado del incidente',
    enum: IncidentStatus
  })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ description: 'Ubicación específica' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Fecha del incidente' })
  @IsOptional()
  @IsDateString()
  incidentDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de descubrimiento' })
  @IsOptional()
  @IsDateString()
  discoveredDate?: string;

  @ApiPropertyOptional({ description: 'Usuarios afectados' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  affectedUsers?: number;

  @ApiPropertyOptional({ description: 'Costo estimado' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Costo real' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional({ description: 'ID del usuario asignado' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Resolución del incidente' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ description: 'Medidas preventivas tomadas' })
  @IsOptional()
  @IsString()
  preventiveMeasures?: string;

  @ApiPropertyOptional({ description: 'Archivos adjuntos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Testigos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  witnesses?: string[];

  @ApiPropertyOptional({ description: 'Incidentes relacionados', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedIncidents?: string[];

  @ApiPropertyOptional({ description: 'Requiere mantenimiento' })
  @IsOptional()
  @IsBoolean()
  maintenanceRequired?: boolean;

  @ApiPropertyOptional({ description: 'ID del registro de mantenimiento' })
  @IsOptional()
  @IsString()
  maintenanceRecordId?: string;

  @ApiPropertyOptional({ description: 'Requiere seguimiento' })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de seguimiento' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Notas de seguimiento' })
  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @ApiPropertyOptional({ description: 'Causa raíz identificada' })
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Acciones correctivas', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctiveActions?: string[];

  @ApiPropertyOptional({ description: 'Etiquetas', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class IncidentReportFiltersDto {
  @ApiPropertyOptional({ description: 'ID del recurso' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Reportado por' })
  @IsOptional()
  @IsString()
  reportedBy?: string;

  @ApiPropertyOptional({ description: 'Asignado a' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de incidente',
    enum: IncidentType
  })
  @IsOptional()
  @IsEnum(IncidentType)
  incidentType?: IncidentType;

  @ApiPropertyOptional({ 
    description: 'Severidad',
    enum: IncidentSeverity
  })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ 
    description: 'Estado',
    enum: IncidentStatus
  })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ 
    description: 'Prioridad',
    enum: IncidentPriority
  })
  @IsOptional()
  @IsEnum(IncidentPriority)
  priority?: IncidentPriority;

  @ApiPropertyOptional({ description: 'Fecha del incidente desde' })
  @IsOptional()
  @IsDateString()
  incidentDateFrom?: string;

  @ApiPropertyOptional({ description: 'Fecha del incidente hasta' })
  @IsOptional()
  @IsDateString()
  incidentDateTo?: string;

  @ApiPropertyOptional({ description: 'Solo incidentes recurrentes' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Solo incidentes que requieren mantenimiento' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  maintenanceRequired?: boolean;

  @ApiPropertyOptional({ description: 'Solo incidentes que requieren seguimiento' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Solo incidentes con reclamos de seguro' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  insuranceClaim?: boolean;

  @ApiPropertyOptional({ description: 'Solo incidentes con reporte policial' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  policeReport?: boolean;

  @ApiPropertyOptional({ description: 'Etiquetas', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Solo incidentes con impacto financiero' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasFinancialImpact?: boolean;

  @ApiPropertyOptional({ description: 'Solo incidentes vencidos' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isOverdue?: boolean;
}

export class AssignIncidentDto {
  @ApiProperty({ description: 'ID del usuario a asignar' })
  @IsString()
  @IsNotEmpty()
  assignedTo: string;
}

export class ResolveIncidentDto {
  @ApiProperty({ description: 'Descripción de la resolución' })
  @IsString()
  @IsNotEmpty()
  resolution: string;

  @ApiPropertyOptional({ description: 'Medidas preventivas implementadas' })
  @IsOptional()
  @IsString()
  preventiveMeasures?: string;

  @ApiPropertyOptional({ description: 'Costo real de la resolución' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;
}

export class EscalateIncidentDto {
  @ApiProperty({ 
    description: 'Nueva prioridad',
    enum: IncidentPriority
  })
  @IsEnum(IncidentPriority)
  newPriority: IncidentPriority;

  @ApiProperty({ 
    description: 'Nueva severidad',
    enum: IncidentSeverity
  })
  @IsEnum(IncidentSeverity)
  newSeverity: IncidentSeverity;

  @ApiPropertyOptional({ description: 'Razón de la escalación' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class LinkIncidentsDto {
  @ApiProperty({ 
    description: 'IDs de incidentes relacionados a vincular',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  relatedIncidentIds: string[];
}

export class CreateInsuranceClaimDto {
  @ApiProperty({ description: 'Número del reclamo de seguro' })
  @IsString()
  @IsNotEmpty()
  claimNumber: string;

  @ApiPropertyOptional({ description: 'Descripción del reclamo' })
  @IsOptional()
  @IsString()
  claimDescription?: string;
}

export class CreatePoliceReportDto {
  @ApiProperty({ description: 'Número del reporte policial' })
  @IsString()
  @IsNotEmpty()
  reportNumber: string;

  @ApiPropertyOptional({ description: 'Estación de policía' })
  @IsOptional()
  @IsString()
  policeStation?: string;
}

export class AddCorrectiveActionDto {
  @ApiProperty({ description: 'Descripción de la acción correctiva' })
  @IsString()
  @IsNotEmpty()
  action: string;
}

export class SetRootCauseDto {
  @ApiProperty({ description: 'Descripción de la causa raíz' })
  @IsString()
  @IsNotEmpty()
  rootCause: string;
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

export class IncidentReportResponseDto {
  @ApiProperty({ description: 'ID único del reporte' })
  id: string;

  @ApiProperty({ description: 'ID del recurso afectado' })
  resourceId: string;

  @ApiProperty({ description: 'Reportado por' })
  reportedBy: string;

  @ApiProperty({ description: 'Tipo de incidente', enum: IncidentType })
  incidentType: IncidentType;

  @ApiProperty({ description: 'Severidad', enum: IncidentSeverity })
  severity: IncidentSeverity;

  @ApiProperty({ description: 'Prioridad', enum: IncidentPriority })
  priority: IncidentPriority;

  @ApiProperty({ description: 'Título del incidente' })
  title: string;

  @ApiProperty({ description: 'Descripción del incidente' })
  description: string;

  @ApiPropertyOptional({ description: 'Ubicación' })
  location?: string;

  @ApiProperty({ description: 'Fecha del incidente' })
  incidentDate: Date;

  @ApiProperty({ description: 'Fecha de descubrimiento' })
  discoveredDate: Date;

  @ApiPropertyOptional({ description: 'Usuarios afectados' })
  affectedUsers?: number;

  @ApiPropertyOptional({ description: 'Costo estimado' })
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Costo real' })
  actualCost?: number;

  @ApiProperty({ description: 'Estado actual', enum: IncidentStatus })
  status: IncidentStatus;

  @ApiPropertyOptional({ description: 'Asignado a' })
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Resolución' })
  resolution?: string;

  @ApiPropertyOptional({ description: 'Fecha de resolución' })
  resolutionDate?: Date;

  @ApiPropertyOptional({ description: 'Medidas preventivas' })
  preventiveMeasures?: string;

  @ApiPropertyOptional({ description: 'Archivos adjuntos', type: [String] })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Testigos', type: [String] })
  witnesses?: string[];

  @ApiPropertyOptional({ description: 'Incidentes relacionados', type: [String] })
  relatedIncidents?: string[];

  @ApiProperty({ description: 'Requiere mantenimiento' })
  maintenanceRequired: boolean;

  @ApiPropertyOptional({ description: 'ID del registro de mantenimiento' })
  maintenanceRecordId?: string;

  @ApiProperty({ description: 'Requiere seguimiento' })
  followUpRequired: boolean;

  @ApiPropertyOptional({ description: 'Fecha de seguimiento' })
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Reclamo de seguro' })
  insuranceClaim?: boolean;

  @ApiPropertyOptional({ description: 'Número de reclamo de seguro' })
  insuranceClaimNumber?: string;

  @ApiPropertyOptional({ description: 'Reporte policial' })
  policeReport?: boolean;

  @ApiPropertyOptional({ description: 'Número de reporte policial' })
  policeReportNumber?: string;

  @ApiProperty({ description: 'Es recurrente' })
  isRecurring: boolean;

  @ApiPropertyOptional({ description: 'Causa raíz' })
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Acciones correctivas', type: [String] })
  correctiveActions?: string[];

  @ApiProperty({ description: 'Número de reaperturas' })
  reopenedCount: number;

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

export class IncidentReportListResponseDto {
  @ApiProperty({ description: 'Lista de reportes de incidentes', type: [IncidentReportResponseDto] })
  reports: IncidentReportResponseDto[];

  @ApiProperty({ description: 'Total de reportes' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}

export class IncidentReportStatisticsDto {
  @ApiProperty({ description: 'Total de reportes' })
  totalReports: number;

  @ApiProperty({ description: 'Incidentes reportados' })
  reportedIncidents: number;

  @ApiProperty({ description: 'Incidentes bajo revisión' })
  underReviewIncidents: number;

  @ApiProperty({ description: 'Incidentes en progreso' })
  inProgressIncidents: number;

  @ApiProperty({ description: 'Incidentes resueltos' })
  resolvedIncidents: number;

  @ApiProperty({ description: 'Incidentes cerrados' })
  closedIncidents: number;

  @ApiProperty({ description: 'Tiempo promedio de resolución en horas' })
  averageResolutionTime: number;

  @ApiProperty({ description: 'Tasa de resolución en porcentaje' })
  resolutionRate: number;

  @ApiPropertyOptional({ description: 'Costo total estimado' })
  totalEstimatedCost?: number;

  @ApiPropertyOptional({ description: 'Costo total real' })
  totalActualCost?: number;

  @ApiPropertyOptional({ description: 'Total de usuarios afectados' })
  affectedUsersTotal?: number;

  @ApiProperty({ description: 'Número total de reaperturas' })
  reopenedCount: number;

  @ApiProperty({ description: 'Distribución por tipo de incidente' })
  byIncidentType: Record<string, number>;

  @ApiProperty({ description: 'Distribución por severidad' })
  bySeverity: Record<string, number>;

  @ApiProperty({ description: 'Distribución por prioridad' })
  byPriority: Record<string, number>;

  @ApiProperty({ description: 'Distribución por estado' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Tendencias mensuales' })
  monthlyTrends: Record<string, number>;

  @ApiProperty({ description: 'Recursos más afectados' })
  topResourcesAffected: Array<{ resourceId: string; count: number }>;
}
