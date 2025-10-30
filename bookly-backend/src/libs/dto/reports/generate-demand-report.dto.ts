import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsArray, IsString } from 'class-validator';

/**
 * Generate Demand Report DTO
 * Used for generating demand analysis reports (RF-37)
 */
export class GenerateDemandReportDto {
  @ApiProperty({ description: 'Start date (ISO format)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO format)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ 
    description: 'Filter by resource types (optional)', 
    type: [String], 
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resourceTypes?: string[];

  @ApiProperty({ 
    description: 'Filter by program IDs (optional)', 
    type: [String], 
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  programIds?: string[];
}
