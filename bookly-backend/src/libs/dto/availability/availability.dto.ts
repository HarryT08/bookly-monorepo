import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithStatusDto } from '../common/base-entity.dto';

export class AvailabilityDto extends BaseEntityWithStatusDto {
  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'Day of week (0-6, Sunday to Saturday)' })
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time (HH:mm format)' })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm format)' })
  endTime: string;
}
