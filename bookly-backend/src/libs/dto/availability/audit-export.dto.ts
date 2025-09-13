import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditCategory, AuditEventType } from '@/apps/availability-service/utils';

/**
 * DTO for exporting audit entries
 * Used in availability-service audit controller
 */
export class AuditExportDto {
  @ApiPropertyOptional({ 
    description: 'Filter by event type',
    example: 'RESERVATION_CREATED'
  })
  @IsOptional()
  @IsString()
  eventType?: AuditEventType;

  @ApiPropertyOptional({ 
    description: 'Filter by audit category',
    example: 'RESERVATION'
  })
  @IsOptional()
  @IsString()
  category?: AuditCategory;

  @ApiPropertyOptional({ 
    description: 'Filter by resource ID',
    example: '60f7b3b3b3b3b3b3b3b3b3b3'
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by user ID',
    example: '60f7b3b3b3b3b3b3b3b3b3b3'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Start date for filtering (ISO format)',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'End date for filtering (ISO format)',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum number of records to export',
    example: 10000,
    default: 10000
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10000;
}

/**
 * DTO for creating test audit entries (development/testing only)
 */
export class CreateTestAuditDto {
  @ApiProperty({ 
    description: 'Event type for the test audit entry',
    example: 'TEST_EVENT'
  })
  @IsString()
  eventType: AuditEventType;

  @ApiProperty({ 
    description: 'Audit category',
    example: 'RESERVATION'
  })
  @IsString()
  category: AuditCategory;

  @ApiProperty({ 
    description: 'Action performed',
    example: 'CREATE'
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({ 
    description: 'Resource ID for the audit entry',
    example: 'test-resource-id'
  })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ 
    description: 'Test data payload',
    example: { testField: 'testValue' }
  })
  @IsOptional()
  testData?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'User ID for test entry',
    example: 'test-user-id'
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
