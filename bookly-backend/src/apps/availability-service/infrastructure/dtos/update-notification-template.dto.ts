/**
 * Update Notification Template DTO
 * Data Transfer Object for updating notification templates
 */

import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannelType } from '../../utils/notification-channel-type.enum';

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ enum: NotificationChannelType })
  @IsOptional()
  @IsEnum(NotificationChannelType)
  channel?: NotificationChannelType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  htmlBody?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
