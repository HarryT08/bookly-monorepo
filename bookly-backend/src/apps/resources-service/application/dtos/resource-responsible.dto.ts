import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

/**
 * HITO 6 - RF-02: Resource Responsible Assignment DTOs
 */

export class AssignResourceResponsibleDto {
  @ApiProperty({
    description: 'User ID to assign as responsible for the resource',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class AssignMultipleResourceResponsiblesDto {
  @ApiProperty({
    description: 'Array of user IDs to assign as responsibles',
    example: ['user1', 'user2'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: string[];
}

export class ResourceResponsibleResponseDto {
  @ApiProperty({ description: 'Assignment ID' })
  id: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User full name' })
  userFullName: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ description: 'User who assigned the responsibility' })
  assignedBy: string;

  @ApiProperty({ description: 'Assigner full name' })
  assignedByFullName: string;

  @ApiProperty({ description: 'Assignment timestamp' })
  assignedAt: Date;

  @ApiProperty({ description: 'Whether the assignment is active' })
  isActive: boolean;
}

export class ResourceResponsiblesListResponseDto {
  @ApiProperty({ type: [ResourceResponsibleResponseDto] })
  responsibles: ResourceResponsibleResponseDto[];

  @ApiProperty({ description: 'Total number of responsibles' })
  total: number;
}
