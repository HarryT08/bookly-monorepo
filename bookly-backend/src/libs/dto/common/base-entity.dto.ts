import { ApiProperty } from '@nestjs/swagger';

export class BaseEntityDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class BaseEntityWithStatusDto extends BaseEntityDto {
  @ApiProperty({ description: 'Active status' })
  isActive: boolean;
}
