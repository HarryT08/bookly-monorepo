import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for setting maintenance status of a resource
 * Implements RF-06 (maintenance of resources) - Clean Architecture patterns
 */
export class SetMaintenanceStatusDto {
  @ApiProperty({ description: 'Whether the resource is in maintenance mode' })
  @IsBoolean()
  inMaintenance: boolean;

  @ApiProperty({ description: 'User ID who is updating the maintenance status' })
  @IsString()
  userId: string;
}
