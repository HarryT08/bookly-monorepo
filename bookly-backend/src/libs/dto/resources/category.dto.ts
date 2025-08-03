import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityWithStatusDto } from '../common/base-entity.dto';

export class CategoryDto extends BaseEntityWithStatusDto {
  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category description' })
  description?: string;

  @ApiProperty({ description: 'Category color for UI' })
  color?: string;
}
