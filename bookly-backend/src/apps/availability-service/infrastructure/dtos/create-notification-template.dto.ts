/**
 * Create Notification Template DTO
 * Data Transfer Object for creating notification templates
 */

import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannelType } from '../../utils/notification-channel-type.enum';

export class CreateNotificationTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  eventType: string;

  @ApiProperty({ enum: NotificationChannelType })
  @IsEnum(NotificationChannelType)
  channel: NotificationChannelType;

  @ApiProperty({ default: 'es' })
  @IsString()
  language: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  htmlBody?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
