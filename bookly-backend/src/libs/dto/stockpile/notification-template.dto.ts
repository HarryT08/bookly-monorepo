import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';
import { IsString, IsOptional, IsBoolean, IsObject, IsEnum, IsInt, Min } from 'class-validator';
import { NotificationChannelType } from '@/apps/availability-service/utils';
import { DocumentDeliveryMethod } from '@/apps/stockpile-service/utils';


export enum NotificationEventType {
  RESERVATION_SUBMITTED = 'RESERVATION_SUBMITTED',
  RESERVATION_APPROVED = 'RESERVATION_APPROVED',
  RESERVATION_REJECTED = 'RESERVATION_REJECTED',
  RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
  APPROVAL_REMINDER = 'APPROVAL_REMINDER',
  RESERVATION_REMINDER = 'RESERVATION_REMINDER',
  AVAILABILITY_CONFIRMATION = 'AVAILABILITY_CONFIRMATION',
  AVAILABILITY_UNAVAILABLE = 'AVAILABILITY_UNAVAILABLE',
  ALTERNATIVE_SUGGESTIONS = 'ALTERNATIVE_SUGGESTIONS'
}

export class CreateNotificationChannelDto {
  @ApiProperty({ description: 'Channel name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Channel type', enum: NotificationChannelType })
  @IsEnum(NotificationChannelType)
  channel: NotificationChannelType;

  @ApiProperty({ description: 'Display name', example: 'Email Notifications' })
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'Supports attachments', default: false })
  @IsOptional()
  @IsBoolean()
  supportsAttachments?: boolean;

  @ApiProperty({ description: 'Supports links', default: true })
  @IsOptional()
  @IsBoolean()
  supportsLinks?: boolean;

  @ApiProperty({ description: 'Max message length', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxMessageLength?: number;

  @ApiProperty({ description: 'Channel settings', type: Object, required: false })
  @IsOptional()
  @IsObject()
  settings?: any;
}

export class NotificationChannelDto extends BaseEntityDto {
  @ApiProperty({ description: 'Channel name' })
  name: string;

  @ApiProperty({ description: 'Channel type', enum: NotificationChannelType })
  channel: NotificationChannelType;

  @ApiProperty({ description: 'Display name' })
  displayName: string;

  @ApiProperty({ description: 'Supports attachments' })
  supportsAttachments: boolean;

  @ApiProperty({ description: 'Supports links' })
  supportsLinks: boolean;

  @ApiProperty({ description: 'Max message length' })
  maxMessageLength?: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Channel settings', type: Object })
  settings?: any;
}

export class CreateNotificationTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Reservation Approved Email' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Channel ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: 'Event type', enum: NotificationEventType })
  @IsEnum(NotificationEventType)
  eventType: NotificationEventType;

  @ApiProperty({ description: 'Resource type scope', required: false, example: 'ROOM' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Category ID scope', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Message subject (for email/SMS)', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Message content with variables' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Available variables', type: Object })
  @IsObject()
  variables: any;

  @ApiProperty({ description: 'Is default template', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Attach document', default: false })
  @IsOptional()
  @IsBoolean()
  attachDocument?: boolean;

  @ApiProperty({ description: 'Document as link', default: false })
  @IsOptional()
  @IsBoolean()
  documentAsLink?: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  createdBy: string;
}

export class UpdateNotificationTemplateDto {
  @ApiProperty({ description: 'Template name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Message subject', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Message content with variables', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Available variables', type: Object, required: false })
  @IsOptional()
  @IsObject()
  variables?: any;

  @ApiProperty({ description: 'Attach document', required: false })
  @IsOptional()
  @IsBoolean()
  attachDocument?: boolean;

  @ApiProperty({ description: 'Document as link', required: false })
  @IsOptional()
  @IsBoolean()
  documentAsLink?: boolean;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class NotificationTemplateDto extends BaseEntityDto {
  @ApiProperty({ description: 'Template name' })
  name: string;

  @ApiProperty({ description: 'Channel ID' })
  channelId: string;

  @ApiProperty({ description: 'Event type', enum: NotificationEventType })
  eventType: NotificationEventType;

  @ApiProperty({ description: 'Resource type scope' })
  resourceType?: string;

  @ApiProperty({ description: 'Category ID scope' })
  categoryId?: string;

  @ApiProperty({ description: 'Message subject' })
  subject?: string;

  @ApiProperty({ description: 'Message content with variables' })
  content: string;

  @ApiProperty({ description: 'Available variables', type: Object })
  variables: any;

  @ApiProperty({ description: 'Is default template' })
  isDefault: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Attach document' })
  attachDocument: boolean;

  @ApiProperty({ description: 'Document as link' })
  documentAsLink: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;
}

export class CreateNotificationConfigDto {
  @ApiProperty({ description: 'Program ID scope', required: false })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiProperty({ description: 'Resource type scope', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Category ID scope', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Channel ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: 'Is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: 'Send immediately', default: true })
  @IsOptional()
  @IsBoolean()
  isImmediate?: boolean;

  @ApiProperty({ description: 'Batch interval in minutes', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  batchInterval?: number;

  @ApiProperty({ description: 'Send documents', default: false })
  @IsOptional()
  @IsBoolean()
  sendDocuments?: boolean;

  @ApiProperty({ description: 'Document method', enum: DocumentDeliveryMethod, required: false })
  @IsOptional()
  @IsString()
  documentMethod?: DocumentDeliveryMethod;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  createdBy: string;
}

export class NotificationConfigDto extends BaseEntityDto {
  @ApiProperty({ description: 'Program ID scope' })
  programId?: string;

  @ApiProperty({ description: 'Resource type scope' })
  resourceType?: string;

  @ApiProperty({ description: 'Category ID scope' })
  categoryId?: string;

  @ApiProperty({ description: 'Channel ID' })
  channelId: string;

  @ApiProperty({ description: 'Is enabled' })
  isEnabled: boolean;

  @ApiProperty({ description: 'Send immediately' })
  isImmediate: boolean;

  @ApiProperty({ description: 'Batch interval in minutes' })
  batchInterval?: number;

  @ApiProperty({ description: 'Send documents' })
  sendDocuments: boolean;

  @ApiProperty({ description: 'Document method', enum: DocumentDeliveryMethod })
  documentMethod?: DocumentDeliveryMethod;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Channel type', enum: NotificationChannelType })
  @IsString()
  @IsEnum(NotificationChannelType)
  channel: NotificationChannelType;

  @ApiProperty({ description: 'Template ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'Recipient ID' })
  @IsString()
  recipientId: string;

  @ApiProperty({ description: 'Variable values for template', type: Object })
  @IsObject()
  variables: any;

  @ApiProperty({ description: 'Has attachment', default: false })
  @IsOptional()
  @IsBoolean()
  hasAttachment?: boolean;

  @ApiProperty({ description: 'Attachment path', required: false })
  @IsOptional()
  @IsString()
  attachmentPath?: string;
}

export class SentNotificationDto extends BaseEntityDto {
  @ApiProperty({ description: 'Template ID' })
  templateId: string;

  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Recipient ID' })
  recipientId: string;

  @ApiProperty({ description: 'Channel', enum: NotificationChannelType })
  channel: NotificationChannelType;

  @ApiProperty({ description: 'Status', example: 'SENT' })
  status: string;

  @ApiProperty({ description: 'Subject' })
  subject?: string;

  @ApiProperty({ description: 'Content' })
  content: string;

  @ApiProperty({ description: 'Has attachment' })
  hasAttachment: boolean;

  @ApiProperty({ description: 'Attachment path' })
  attachmentPath?: string;

  @ApiProperty({ description: 'Sent at' })
  sentAt?: Date;

  @ApiProperty({ description: 'Delivered at' })
  deliveredAt?: Date;

  @ApiProperty({ description: 'Read at' })
  readAt?: Date;

  @ApiProperty({ description: 'Error message' })
  errorMessage?: string;

  @ApiProperty({ description: 'Variable values for template', type: Object })
  variables: any;
}
