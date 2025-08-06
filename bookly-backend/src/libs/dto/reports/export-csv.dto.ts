import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

export enum ReportType {
  USAGE = 'USAGE',
  USER_RESERVATIONS = 'USER_RESERVATIONS',
  RESOURCE_UTILIZATION = 'RESOURCE_UTILIZATION',
  FEEDBACK = 'FEEDBACK',
  AUDIT_LOG = 'AUDIT_LOG',
}

/**
 * DTO for RF-33: CSV Export request
 * Configuration for exporting reports in CSV format
 */
export class ExportCsvDto {
  @ApiProperty({
    description: 'Type of report to export',
    enum: ReportType,
    example: ReportType.USAGE,
  })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({
    description: 'Export format',
    enum: ExportFormat,
    example: ExportFormat.CSV,
  })
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.CSV;

  @ApiPropertyOptional({
    description: 'Custom filename for the export (without extension)',
    example: 'usage_report_2024_Q1',
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({
    description: 'Specific columns to include in the export',
    type: [String],
    example: ['resourceName', 'programName', 'reservationCount', 'utilizationRate'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({
    description: 'Include column headers in the export',
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeHeaders?: boolean = true;

  @ApiPropertyOptional({
    description: 'Custom column headers (must match columns array length)',
    type: [String],
    example: ['Nombre del Recurso', 'Programa Académico', 'Total Reservas', 'Tasa de Utilización'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customHeaders?: string[];

  @ApiPropertyOptional({
    description: 'CSV delimiter character',
    example: ',',
    default: ',',
  })
  @IsOptional()
  @IsString()
  delimiter?: string = ',';

  @ApiPropertyOptional({
    description: 'Include metadata in the export (generation date, filters applied, etc.)',
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeMetadata?: boolean = true;

  @ApiPropertyOptional({
    description: 'Filters applied to the original report (will be included in metadata)',
    type: 'object',
    example: {
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      programIds: ['60f7b3b3b3b3b3b3b3b3b3b3'],
    },
  })
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Send export via email instead of direct download',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  sendByEmail?: boolean = false;

  @ApiPropertyOptional({
    description: 'Email address to send the export (required if sendByEmail is true)',
    example: 'admin@ufps.edu.co',
  })
  @IsOptional()
  @IsString()
  emailAddress?: string;
}
