import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class AuditLogDto extends BaseEntityDto {
  @ApiProperty({ description: 'User ID who performed the action' })
  userId?: string;

  @ApiProperty({ description: 'Action performed', example: 'CREATE' })
  action: string;

  @ApiProperty({ description: 'Entity type', example: 'USER' })
  entity: string;

  @ApiProperty({ description: 'Entity ID' })
  entityId?: string;

  @ApiProperty({ description: 'Old values before change' })
  oldValues?: any;

  @ApiProperty({ description: 'New values after change' })
  newValues?: any;

  @ApiProperty({ description: 'IP address' })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent' })
  userAgent?: string;
}
