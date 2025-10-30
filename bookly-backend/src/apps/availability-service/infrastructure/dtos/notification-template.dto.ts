/**
 * Notification Template DTO
 * Data Transfer Object for notification template responses
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannelType } from '../../utils/notification-channel-type.enum';

export class NotificationTemplateDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  eventType: string;

  @ApiProperty({ enum: NotificationChannelType })
  channel: NotificationChannelType;

  @ApiProperty()
  language: string;

  @ApiPropertyOptional()
  subject?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiProperty()
  body: string;

  @ApiPropertyOptional()
  htmlBody?: string;

  @ApiProperty({ type: [String] })
  variables: string[];

  @ApiPropertyOptional()
  metadata?: any;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  updatedBy?: string;
}
