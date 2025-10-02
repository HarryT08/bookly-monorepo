import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;
}
