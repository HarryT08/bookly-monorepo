import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class WaitingListDto extends BaseEntityDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'Requested date' })
  requestedDate: Date;

  @ApiProperty({ description: 'Priority level' })
  priority: number;

  @ApiProperty({ description: 'Status', example: 'WAITING' })
  status: string;
}
