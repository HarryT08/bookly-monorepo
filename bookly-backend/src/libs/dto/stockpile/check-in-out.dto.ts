import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class CheckInOutDto extends BaseEntityDto {
  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Check-in time' })
  checkInTime?: Date;

  @ApiProperty({ description: 'Check-out time' })
  checkOutTime?: Date;

  @ApiProperty({ description: 'Additional notes' })
  notes?: string;
}
