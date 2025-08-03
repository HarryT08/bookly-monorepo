import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class MaintenanceDto extends BaseEntityDto {
  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'Maintenance title' })
  title: string;

  @ApiProperty({ description: 'Maintenance description' })
  description?: string;

  @ApiProperty({ description: 'Maintenance status', example: 'SCHEDULED' })
  status: string;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  endDate?: Date;
}
