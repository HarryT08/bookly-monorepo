import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length, Matches, IsBoolean } from 'class-validator';

/**
 * HITO 6 - RF-02: Program DTOs
 */

export class CreateProgramDto {
  @ApiProperty({
    description: 'Program name',
    example: 'Ingeniería de Sistemas',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    description: 'Unique program code',
    example: 'ING-SIS',
    pattern: '^[A-Z0-9-]{3,10}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{3,10}$/, {
    message: 'Code must be 3-10 characters, uppercase letters, numbers and hyphens only',
  })
  code: string;

  @ApiProperty({
    description: 'Faculty name',
    example: 'Facultad de Ingeniería',
  })
  @IsString()
  @IsNotEmpty()
  facultyName: string;

  @ApiPropertyOptional({
    description: 'Program description',
    example: 'Programa de Ingeniería de Sistemas y Computación',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProgramDto {
  @ApiPropertyOptional({
    description: 'Whether the program is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Program name',
    example: 'Ingeniería de Sistemas y Computación',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Faculty name',
    example: 'Facultad de Ingeniería',
  })
  @IsString()
  @IsOptional()
  facultyName?: string;

  @ApiPropertyOptional({
    description: 'Program description',
    example: 'Programa de Ingeniería de Sistemas y Computación',
  })
  @IsString()
  @IsOptional()
  description?: string;
  
  code?: string;
}

export class ProgramResponseDto {
  @ApiProperty({ description: 'Program ID' })
  id: string;

  @ApiProperty({ description: 'Program name' })
  name: string;

  @ApiProperty({ description: 'Program code' })
  code: string;

  @ApiProperty({ description: 'Faculty name' })
  facultyName: string;

  @ApiPropertyOptional({ description: 'Program description' })
  description?: string;

  @ApiProperty({ description: 'Whether the program is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class ProgramListResponseDto {
  @ApiProperty({ type: [ProgramResponseDto] })
  programs: ProgramResponseDto[];

  @ApiProperty({ description: 'Total number of programs' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;
}
