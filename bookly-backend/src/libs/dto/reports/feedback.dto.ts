import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class FeedbackDto extends BaseEntityDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId?: string;

  @ApiProperty({ description: 'Reservation ID' })
  reservationId?: string;

  @ApiProperty({ description: 'Rating (1-5 scale)' })
  rating: number;

  @ApiProperty({ description: 'Feedback comment' })
  comment?: string;

  @ApiProperty({ description: 'Feedback category' })
  category?: string;
}
