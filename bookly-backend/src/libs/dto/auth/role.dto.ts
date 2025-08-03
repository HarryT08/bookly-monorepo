import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithStatusDto } from '../common/base-entity.dto';

export class RoleDto extends BaseEntityWithStatusDto {
  @ApiProperty({ description: 'Role name' })
  name: string;

  @ApiProperty({ description: 'Role description' })
  description?: string;

  @ApiProperty({ description: 'Role permissions', type: [String] })
  permissions: string[];
}
