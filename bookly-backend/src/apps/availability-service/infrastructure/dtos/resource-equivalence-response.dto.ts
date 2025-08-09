/**
 * RF-15: Resource Equivalence Response DTO
 * Response structure for resource equivalence matching
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EquivalenceType } from '../../utils';

export class ResourceFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'projector'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Feature value or description',
    example: 'HD 1080p'
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Whether this feature is available',
    example: true
  })
  @IsBoolean()
  available: boolean;

  @ApiProperty({
    description: 'Feature importance score (0-100)',
    example: 85
  })
  @IsNumber()
  importance: number;
}

export class EquivalenceScoreDto {
  @ApiProperty({
    description: 'Overall equivalence score (0-100)',
    example: 92
  })
  @IsNumber()
  overall: number;

  @ApiProperty({
    description: 'Capacity match score (0-100)',
    example: 95
  })
  @IsNumber()
  capacity: number;

  @ApiProperty({
    description: 'Location proximity score (0-100)',
    example: 88
  })
  @IsNumber()
  location: number;

  @ApiProperty({
    description: 'Features match score (0-100)',
    example: 90
  })
  @IsNumber()
  features: number;

  @ApiProperty({
    description: 'Availability match score (0-100)',
    example: 100
  })
  @IsNumber()
  availability: number;

  @ApiProperty({
    description: 'Quality/condition score (0-100)',
    example: 85
  })
  @IsNumber()
  quality: number;
}

export class ResourceEquivalenceResponseDto {
  @ApiProperty({
    description: 'Resource unique identifier',
    example: 'resource456-789-012'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'Aula 203'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Resource type',
    example: 'CLASSROOM'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Resource capacity',
    example: 35
  })
  @IsNumber()
  capacity: number;

  @ApiProperty({
    description: 'Resource location or building',
    example: 'Edificio A - Piso 2'
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Type of equivalence match',
    enum: EquivalenceType,
    example: EquivalenceType.IDENTICAL
  })
  @IsString()
  equivalenceType: EquivalenceType;

  @ApiProperty({
    description: 'Detailed equivalence scores',
    type: EquivalenceScoreDto
  })
  @ValidateNested()
  @Type(() => EquivalenceScoreDto)
  scores: EquivalenceScoreDto;

  @ApiProperty({
    description: 'Distance from original resource in meters',
    example: 25,
    required: false
  })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiProperty({
    description: 'Walking time to resource in minutes',
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  walkingTime?: number;

  @ApiProperty({
    description: 'Resource features and capabilities',
    type: [ResourceFeatureDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceFeatureDto)
  features: ResourceFeatureDto[];

  @ApiProperty({
    description: 'Availability status for the requested time slot',
    example: 'AVAILABLE'
  })
  @IsString()
  availabilityStatus: string;

  @ApiProperty({
    description: 'Whether this resource is currently available',
    example: true
  })
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({
    description: 'Whether this resource requires special approval',
    example: false
  })
  @IsBoolean()
  requiresApproval: boolean;

  @ApiProperty({
    description: 'Estimated setup time required in minutes',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  setupTime?: number;

  @ApiProperty({
    description: 'Additional costs associated with this resource',
    example: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  additionalCost?: number;

  @ApiProperty({
    description: 'Reasons why this resource is a good match',
    example: ['Same capacity', 'Same building', 'All required features available']
  })
  @IsArray()
  @IsString({ each: true })
  matchReasons: string[];

  @ApiProperty({
    description: 'Potential issues or limitations',
    example: ['Slightly smaller', 'No air conditioning'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  limitations?: string[];

  @ApiProperty({
    description: 'Recommendation priority (1-10, 10 being highest)',
    example: 8
  })
  @IsNumber()
  recommendationPriority: number;

  @ApiProperty({
    description: 'Last maintenance or inspection date',
    example: '2024-03-01T00:00:00Z',
    required: false
  })
  @IsOptional()
  @IsString()
  lastMaintenance?: string;

  @ApiProperty({
    description: 'Resource condition notes',
    example: 'Excellent condition, recently renovated',
    required: false
  })
  @IsOptional()
  @IsString()
  conditionNotes?: string;

  @ApiProperty({
    description: 'Program or department that manages this resource',
    example: 'Ingeniería de Sistemas',
    required: false
  })
  @IsOptional()
  @IsString()
  managingProgram?: string;
}
