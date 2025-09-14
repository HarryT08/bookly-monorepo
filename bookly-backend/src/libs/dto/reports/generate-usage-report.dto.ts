import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';

/**
 * Generate Usage Report DTO
 * Used for generating usage reports (RF-31)
 */
export class GenerateUsageReportDto {
  @ApiProperty({ description: 'Start date (ISO format)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO format)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ 
    description: 'Filter by resource IDs (optional)', 
    type: [String], 
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resourceIds?: string[];

  @ApiProperty({ 
    description: 'Filter by program IDs (optional)', 
    type: [String], 
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  programIds?: string[];

  @ApiProperty({ 
    description: 'Include detailed data (optional)', 
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  includeDetails?: boolean;
}
