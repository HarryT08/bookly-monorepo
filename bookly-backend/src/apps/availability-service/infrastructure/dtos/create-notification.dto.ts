/**
 * Notification DTOs
 * Data Transfer Objects for notification management
 */

import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannelType } from '../../utils';
import { NotificationPriority } from '../../utils';

export class NotificationChannelDto {
  @ApiProperty({ enum: NotificationChannelType })
  @IsEnum(NotificationChannelType)
  type: NotificationChannelType;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ enum: NotificationPriority })
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: any;
}

export class NotificationRecipientDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pushTokens?: string[];

  @ApiProperty()
  @IsString()
  preferredLanguage: string;

  @ApiProperty()
  @IsObject()
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    whatsapp: boolean;
  };

  @ApiProperty()
  @IsString()
  timezone: string;
}

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  eventType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aggregateId?: string;

  @ApiProperty({ enum: NotificationPriority })
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @ApiProperty({ type: [NotificationRecipientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationRecipientDto)
  recipients: NotificationRecipientDto[];

  @ApiProperty()
  @IsObject()
  templateVariables: Record<string, any>;

  @ApiProperty({ type: [NotificationChannelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationChannelDto)
  channels: NotificationChannelDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class NotificationTemplateDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  eventType: string;

  @ApiProperty()
  @IsString()
  channel: string;

  @ApiProperty()
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
}

export class CreateNotificationTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  eventType: string;

  @ApiProperty()
  @IsString()
  channel: string;

  @ApiProperty()
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
}

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

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
}
