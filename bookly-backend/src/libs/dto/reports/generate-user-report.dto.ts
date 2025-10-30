import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsObject } from 'class-validator';

/**
 * Generate User Report DTO
 * Used for generating user reports (RF-32)
 */
export class GenerateUserReportDto {
  @ApiProperty({ description: 'User ID for the report' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Start date (ISO format, optional)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO format, optional)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ 
    description: 'Additional filters (optional)', 
    type: Object, 
    required: false 
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}
