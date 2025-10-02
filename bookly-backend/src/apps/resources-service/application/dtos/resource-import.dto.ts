import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsArray, ValidateNested, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ImportStatus } from '@apps/resources-service/utils/import-status.enum';
import { Type } from 'class-transformer';

/**
 * HITO 6 - RF-04: Resource Import DTOs
 */

export class ImportResourceRowDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'Aula 101',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Resource type',
    example: 'ROOM',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Resource capacity',
    example: 40,
  })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    description: 'Resource description',
    example: 'Aula de clases con proyector',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Resource location',
    example: 'Edificio A, Piso 1',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Program code for assignment',
    example: 'ING-SIS',
  })
  @IsString()
  @IsOptional()
  programCode?: string;

  @ApiPropertyOptional({
    description: 'Category names (comma-separated)',
    example: 'Salón,Multimedia',
  })
  @IsString()
  @IsOptional()
  categories?: string;

  @ApiPropertyOptional({
    description: 'Custom schedule (JSON format)',
    example: '{"monday": {"start": "06:00", "end": "22:00"}}',
  })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiPropertyOptional({
    description: 'Custom availability rules (JSON format)',
    example: '{"minAdvanceHours": 2, "maxReservationHours": 4}',
  })
  @IsString()
  @IsOptional()
  availability?: string;
}

export class ImportResourcesDto {
  @ApiProperty({
    description: 'CSV file content as array of resource rows',
    type: [ImportResourceRowDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportResourceRowDto)
  resources: ImportResourceRowDto[];

  @ApiPropertyOptional({
    description: 'Import options',
  })
  @IsOptional()
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  };
}

export class ImportErrorDto {
  @ApiProperty({ description: 'Row number with error' })
  row: number;

  @ApiProperty({ description: 'Field name with error' })
  field: string;

  @ApiProperty({ description: 'Invalid value' })
  value: any;

  @ApiProperty({ description: 'Error message' })
  message: string;
}

export class ImportSummaryDto {
  @ApiProperty({ description: 'Total rows processed' })
  totalRows: number;

  @ApiProperty({ description: 'Successfully imported rows' })
  successfulRows: number;

  @ApiProperty({ description: 'Failed rows' })
  failedRows: number;

  @ApiProperty({ type: [ImportErrorDto], description: 'Import errors' })
  errors: ImportErrorDto[];

  @ApiProperty({ type: [String], description: 'Import warnings' })
  warnings: string[];

  @ApiProperty({ description: 'Import duration in milliseconds' })
  duration: number;
}

export class ImportRowDto {
  @ApiProperty({ description: 'Row number in CSV' })
  rowNumber: number;

  @ApiProperty({ description: 'Resource name' })
  name: string;

  @ApiProperty({ description: 'Resource type' })
  type: string;

  @ApiProperty({ description: 'Resource capacity' })
  capacity: number;

  @ApiProperty({ description: 'Resource location', required: false })
  location?: string;

  @ApiProperty({ description: 'Resource description', required: false })
  description?: string;

  @ApiProperty({ description: 'Resource schedule', required: false })
  schedule?: string;

  @ApiProperty({ description: 'Resource availability', required: false })
  availability?: string;

  @ApiProperty({ description: 'Whether row is valid' })
  isValid: boolean;

  @ApiProperty({ type: [String], description: 'Validation errors for this row' })
  errors: string[];
}

export class ImportPreviewDto {
  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'Total rows in file' })
  totalRows: number;

  @ApiProperty({ description: 'Valid rows count' })
  validRows: number;

  @ApiProperty({ description: 'Invalid rows count' })
  invalidRows: number;

  @ApiProperty({ type: [String], description: 'Validation errors' })
  errors: string[];

  @ApiProperty({ type: [ImportRowDto], description: 'Preview of rows (first 100)' })
  rows: ImportRowDto[];

  @ApiProperty({ description: 'Whether import can proceed' })
  canProceed: boolean;
}

export class ResourceImportResponseDto {
  @ApiProperty({ description: 'Import ID' })
  id: string;

  @ApiProperty({ description: 'Generated filename' })
  filename: string;

  @ApiProperty({ description: 'Original filename' })
  originalFilename: string;

  @ApiProperty({ description: 'Total rows in file' })
  totalRows: number;

  @ApiProperty({ description: 'Successfully imported rows' })
  successfulRows: number;

  @ApiProperty({ description: 'Failed rows' })
  failedRows: number;

  @ApiProperty({ enum: ImportStatus, description: 'Import status' })
  status: ImportStatus;

  @ApiProperty({ type: [ImportErrorDto], description: 'Import errors' })
  errors: ImportErrorDto[];

  @ApiProperty({ type: ImportSummaryDto, description: 'Import summary' })
  summary: ImportSummaryDto;

  @ApiProperty({ description: 'User who initiated the import' })
  importedBy: string;

  @ApiProperty({ description: 'Import start time' })
  importedAt: Date;

  @ApiProperty({ description: 'Import completion time', required: false })
  completedAt?: Date;
}

export class ResourceImportListResponseDto {
  @ApiProperty({ type: [ResourceImportResponseDto] })
  imports: ResourceImportResponseDto[];

  @ApiProperty({ description: 'Total number of imports' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;
}

export class ImportStatisticsDto {
  @ApiProperty({ description: 'Total number of imports' })
  totalImports: number;

  @ApiProperty({ description: 'Number of successful imports' })
  successfulImports: number;

  @ApiProperty({ description: 'Number of failed imports' })
  failedImports: number;

  @ApiProperty({ description: 'Total resources imported across all imports' })
  totalResourcesImported: number;

  @ApiProperty({ description: 'Average success rate percentage' })
  averageSuccessRate: number;
}

export { ImportStatus };

