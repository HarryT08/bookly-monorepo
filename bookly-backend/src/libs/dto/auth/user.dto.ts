import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';

export class UserDto extends BaseEntityDto {
  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles?: string[];
}
