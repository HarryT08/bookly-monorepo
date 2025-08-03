import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class ApprovalDto extends BaseEntityDto {
  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Approver ID' })
  approverId?: string;

  @ApiProperty({ description: 'Approval status', example: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'Approval comments' })
  comments?: string;

  @ApiProperty({ description: 'Approved date' })
  approvedAt?: Date;
}
