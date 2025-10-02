import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class ReservationDto extends BaseEntityDto {
  @ApiProperty({ description: 'Reservation title' })
  title: string;

  @ApiProperty({ description: 'Reservation description' })
  description?: string;

  @ApiProperty({ description: 'Start date and time' })
  startDate: Date;

  @ApiProperty({ description: 'End date and time' })
  endDate: Date;

  @ApiProperty({ description: 'Reservation status', example: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'Is recurring reservation' })
  isRecurring: boolean;

  @ApiProperty({ description: 'Recurrence pattern' })
  recurrence?: any;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;
}
