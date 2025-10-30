import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

/**
 * Create Feedback DTO
 * Used for creating user feedback (RF-34)
 */
export class CreateFeedbackDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Resource ID (optional)' })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiProperty({ description: 'Reservation ID (optional)' })
  @IsString()
  @IsOptional()
  reservationId?: string;

  @ApiProperty({ 
    description: 'Rating (1-5 scale)', 
    minimum: 1, 
    maximum: 5 
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Feedback comment (optional)' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'Feedback category (optional)' })
  @IsString()
  @IsOptional()
  category?: string;
}
