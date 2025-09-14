import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { ApiResponse as StandardApiResponse } from '@libs/dto/common/response.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { NotificationTemplateService } from '../../application/services/notification-template.service';
import {
  CreateNotificationChannelDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  CreateNotificationConfigDto,
  SendNotificationDto,
  NotificationChannelDto,
  NotificationTemplateDto,
  NotificationConfigDto,
  SentNotificationDto,
  NotificationEventType
} from '@libs/dto/stockpile/notification-template.dto';
import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';
import { STOCKPILE_URLS } from '../../utils/maps/urls.map';

@ApiTags('Notification Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(STOCKPILE_URLS.NOTIFICATION_TEMPLATES)
export class NotificationTemplateController {
  constructor(private readonly notificationTemplateService: NotificationTemplateService) {}

  @Post(STOCKPILE_URLS.NOTIFICATION_CHANNEL_CREATE)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create notification channel' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification channel created successfully', type: NotificationChannelDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createNotificationChannel(
    @Body() dto: CreateNotificationChannelDto
  ): Promise<NotificationChannelDto> {
    return await this.notificationTemplateService.createNotificationChannel(dto);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CHANNELS)
  @ApiOperation({ summary: 'Get notification channels' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification channels retrieved successfully', type: [NotificationChannelDto] })
  async getNotificationChannels(
    @Query('isActive') isActive?: boolean
  ): Promise<NotificationChannelDto[]> {
    return await this.notificationTemplateService.getNotificationChannels(isActive);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CHANNEL_BY_ID)
  @ApiOperation({ summary: 'Get notification channel by ID' })
  @ApiParam({ name: 'id', description: 'Notification channel ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification channel retrieved successfully', type: NotificationChannelDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification channel not found' })
  async getNotificationChannelById(@Param('id') id: string): Promise<NotificationChannelDto | null> {
    return await this.notificationTemplateService.getNotificationChannelById(id);
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_CREATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification template created successfully', type: NotificationTemplateDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createNotificationTemplate(
    @Body() dto: CreateNotificationTemplateDto,
    @CurrentUser() user: any
  ): Promise<NotificationTemplateDto> {
    dto.createdBy = user.id;
    return await this.notificationTemplateService.createNotificationTemplate(dto);
  }

  @Put(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_UPDATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Update notification template' })
  @ApiParam({ name: 'id', description: 'Notification template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification template updated successfully', type: NotificationTemplateDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification template not found' })
  async updateNotificationTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplateDto> {
    return await this.notificationTemplateService.updateNotificationTemplate(id, dto);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATES)
  @ApiOperation({ summary: 'Get notification templates' })
  @ApiQuery({ name: 'channelId', required: false, description: 'Filter by channel ID' })
  @ApiQuery({ name: 'eventType', required: false, enum: NotificationEventType, description: 'Filter by event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification templates retrieved successfully' })
  async getNotificationTemplates(
    @Query('channelId') channelId?: string,
    @Query('eventType') eventType?: NotificationEventType,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ templates: NotificationTemplateDto[]; total: number }> {
    return await this.notificationTemplateService.getNotificationTemplates(
      channelId,
      eventType,
      resourceType,
      categoryId,
      isActive,
      page,
      limit
    );
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_BY_ID)
  @ApiOperation({ summary: 'Get notification template by ID' })
  @ApiParam({ name: 'id', description: 'Notification template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification template retrieved successfully', type: NotificationTemplateDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification template not found' })
  async getNotificationTemplateById(@Param('id') id: string): Promise<NotificationTemplateDto | null> {
    return await this.notificationTemplateService.getNotificationTemplateById(id);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_DEFAULT_SEARCH)
  @ApiOperation({ summary: 'Get default notification template for scope' })
  @ApiQuery({ name: 'channelId', required: true, description: 'Channel ID' })
  @ApiQuery({ name: 'eventType', required: true, enum: NotificationEventType, description: 'Event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Default notification template retrieved successfully', type: NotificationTemplateDto })
  async getDefaultNotificationTemplate(
    @Query('channelId') channelId: string,
    @Query('eventType') eventType: NotificationEventType,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string
  ): Promise<NotificationTemplateDto | null> {
    return await this.notificationTemplateService.getDefaultNotificationTemplate(
      channelId,
      eventType,
      resourceType,
      categoryId
    );
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_VARIABLES)
  @ApiOperation({ summary: 'Get notification template variables' })
  @ApiParam({ name: 'id', description: 'Notification template ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification template variables retrieved successfully' })
  async getNotificationTemplateVariables(@Param('id') id: string): Promise<any> {
    return await this.notificationTemplateService.getNotificationTemplateVariables(id);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_AVAILABLE_VARIABLES)
  @ApiOperation({ summary: 'Get available notification variables' })
  @ApiQuery({ name: 'eventType', required: true, enum: NotificationEventType, description: 'Event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Available notification variables retrieved successfully' })
  async getAvailableNotificationVariables(
    @Query('eventType') eventType: NotificationEventType,
    @Query('resourceType') resourceType?: string
  ): Promise<any> {
    return await this.notificationTemplateService.getAvailableNotificationVariables(eventType, resourceType);
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_CONFIGS)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create notification config' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification config created successfully', type: NotificationConfigDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createNotificationConfig(
    @Body() dto: CreateNotificationConfigDto,
    @CurrentUser() user: any
  ): Promise<NotificationConfigDto> {
    dto.createdBy = user.id;
    return await this.notificationTemplateService.createNotificationConfig(dto);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CONFIGS)
  @ApiOperation({ summary: 'Get notification configs' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'channelId', required: false, description: 'Filter by channel ID' })
  @ApiQuery({ name: 'isEnabled', required: false, description: 'Filter by enabled status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification configs retrieved successfully', type: [NotificationConfigDto] })
  async getNotificationConfigs(
    @Query('programId') programId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('channelId') channelId?: string,
    @Query('isEnabled') isEnabled?: boolean
  ): Promise<NotificationConfigDto[]> {
    return await this.notificationTemplateService.getNotificationConfigs(
      programId,
      resourceType,
      categoryId,
      channelId,
      isEnabled
    );
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CONFIGS_BY_ID)
  @ApiOperation({ summary: 'Get notification config by ID' })
  @ApiParam({ name: 'id', description: 'Notification config ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification config retrieved successfully', type: NotificationConfigDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification config not found' })
  async getNotificationConfigById(@Param('id') id: string): Promise<NotificationConfigDto | null> {
    return await this.notificationTemplateService.getNotificationConfigById(id);
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SEND)
  @ApiOperation({ summary: 'Send notification' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification sent successfully', type: SentNotificationDto })
  async sendNotification(
    @Body() dto: SendNotificationDto
  ): Promise<SentNotificationDto> {
    return await this.notificationTemplateService.sendNotification(dto);
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SEND_BATCH)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Send batch notifications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Batch notifications sent successfully' })
  async sendBatchNotifications(
    @Body() body: { channelId: string; notificationIds: string[] }
  ): Promise<void> {
    return await this.notificationTemplateService.sendBatchNotifications(body.channelId, body.notificationIds);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SENT_BY_RESERVATION)
  @ApiOperation({ summary: 'Get sent notifications by reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sent notifications retrieved successfully', type: [SentNotificationDto] })
  async getSentNotificationsByReservation(
    @Param('reservationId') reservationId: string
  ): Promise<SentNotificationDto[]> {
    return await this.notificationTemplateService.getSentNotificationsByReservation(reservationId);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SENT_BY_RECIPIENT)
  @ApiOperation({ summary: 'Get sent notifications by recipient' })
  @ApiParam({ name: 'recipientId', description: 'Recipient ID' })
  @ApiQuery({ name: 'channel', required: false, enum: NotificationChannelType, description: 'Filter by channel' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sent notifications retrieved successfully' })
  async getSentNotificationsByRecipient(
    @Param('recipientId') recipientId: string,
    @Query('channel') channel?: NotificationChannelType,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ notifications: SentNotificationDto[]; total: number }> {
    return await this.notificationTemplateService.getSentNotificationsByRecipient(
      recipientId,
      channel,
      status,
      page,
      limit
    );
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_PENDING)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pending notifications' })
  @ApiQuery({ name: 'channelId', required: false, description: 'Filter by channel ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pending notifications retrieved successfully', type: [SentNotificationDto] })
  async getPendingNotifications(
    @Query('channelId') channelId?: string
  ): Promise<SentNotificationDto[]> {
    return await this.notificationTemplateService.getPendingNotifications(channelId);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_BATCH)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get notifications for batch processing' })
  @ApiParam({ name: 'channelId', description: 'Channel ID' })
  @ApiQuery({ name: 'batchInterval', required: true, description: 'Batch interval in milliseconds', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notifications for batch retrieved successfully', type: [SentNotificationDto] })
  async getNotificationsForBatch(
    @Param('channelId') channelId: string,
    @Query('batchInterval') batchInterval: number
  ): Promise<SentNotificationDto[]> {
    return await this.notificationTemplateService.getNotificationsForBatch(channelId, batchInterval);
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_MARK_READ)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read successfully' })
  async markNotificationAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    return await this.notificationTemplateService.markNotificationAsRead(id, user.id);
  }
}
