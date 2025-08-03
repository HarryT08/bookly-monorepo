import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithStatusDto } from '../common/base-entity.dto';

export class ResourceDto extends BaseEntityWithStatusDto {
  @ApiProperty({ description: 'Resource name' })
  name: string;

  @ApiProperty({ description: 'Resource description' })
  description?: string;

  @ApiProperty({ description: 'Resource type', example: 'ROOM' })
  type: string;

  @ApiProperty({ description: 'Resource capacity' })
  capacity?: number;

  @ApiProperty({ description: 'Resource location' })
  location?: string;

  @ApiProperty({ description: 'Resource attributes' })
  attributes?: any;

  @ApiProperty({ description: 'Category ID' })
  categoryId?: string;
}
