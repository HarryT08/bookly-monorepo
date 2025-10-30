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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { ApiResponseBookly, PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse as SwaggerApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';

// Import Commands
import {
  CreateNotificationChannelCommand,
  CreateNotificationTemplateCommand,
  UpdateNotificationTemplateCommand,
  CreateNotificationConfigCommand,
  SendNotificationCommand,
  SendBatchNotificationsCommand,
  MarkNotificationAsReadCommand
} from '@apps/stockpile-service/application/commands/notification-template.commands';

// Import Queries
import {
  GetNotificationChannelsQuery,
  GetNotificationChannelByIdQuery,
  GetNotificationTemplatesQuery,
  GetNotificationTemplateByIdQuery,
  GetDefaultNotificationTemplateQuery,
  GetNotificationTemplateVariablesQuery,
  GetAvailableNotificationVariablesQuery,
  GetNotificationConfigsQuery,
  GetNotificationConfigByIdQuery,
  GetSentNotificationsByReservationQuery,
  GetSentNotificationsByRecipientQuery,
  GetPendingNotificationsQuery,
  GetNotificationsForBatchQuery
} from '@apps/stockpile-service/application/queries/notification-template.queries';
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
import { STOCKPILE_URLS } from '@apps/stockpile-service/utils/maps/urls.map';

@ApiTags('Notification Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(STOCKPILE_URLS.NOTIFICATION_TEMPLATES)
export class NotificationTemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post(STOCKPILE_URLS.NOTIFICATION_CHANNEL_CREATE)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create notification channel' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Notification channel created successfully', type: NotificationChannelDto })
  @SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createNotificationChannel(
    @Body() dto: CreateNotificationChannelDto
  ): Promise<ApiResponseBookly<NotificationChannelDto>> {
    const command = new CreateNotificationChannelCommand(
      dto.name,
      dto.channel,
      dto.displayName,
      dto.supportsAttachments,
      dto.supportsLinks,
      dto.maxMessageLength,
      dto.settings
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification channel created successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CHANNELS)
  @ApiOperation({ summary: 'Get notification channels' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification channels retrieved successfully', type: [NotificationChannelDto] })
  async getNotificationChannels(
    @Query('isActive') isActive?: boolean
  ): Promise<ApiResponseBookly<NotificationChannelDto[]>> {
    const query = new GetNotificationChannelsQuery(isActive);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Notification channels retrieved successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CHANNEL_BY_ID)
  @ApiOperation({ summary: 'Get notification channel by ID' })
  @ApiParam({ name: 'id', description: 'Notification channel ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification channel retrieved successfully', type: NotificationChannelDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification channel not found' })
  async getNotificationChannelById(@Param('id') id: string): Promise<ApiResponseBookly<NotificationChannelDto | null>> {
    const query = new GetNotificationChannelByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Notification channel retrieved successfully');
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_CREATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create notification template' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Notification template created successfully', type: NotificationTemplateDto })
  @SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createNotificationTemplate(
    @Body() dto: CreateNotificationTemplateDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<NotificationTemplateDto>> {
    const command = new CreateNotificationTemplateCommand(
      dto.name,
      dto.channelId,
      dto.eventType,
      dto.resourceType,
      dto.categoryId,
      dto.subject,
      dto.variables,
      dto.isDefault,
      dto.attachDocument,
      dto.documentAsLink,
      new Date(),
      new Date(),
      dto.content,
      user.id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification template created successfully');
  }

  @Put(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_UPDATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Update notification template' })
  @ApiParam({ name: 'id', description: 'Notification template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification template updated successfully', type: NotificationTemplateDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification template not found' })
  async updateNotificationTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto
  ): Promise<ApiResponseBookly<NotificationTemplateDto>> {
    const command = new UpdateNotificationTemplateCommand(
      id,
      dto.name,
      dto.subject,
      dto.content,
      dto.variables,
      dto.isActive
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification template updated successfully');
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
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification templates retrieved successfully' })
  async getNotificationTemplates(
    @Query('channelId') channelId?: string,
    @Query('eventType') eventType?: NotificationEventType,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<ApiResponseBookly<NotificationTemplateDto[]>> {
    const query = new GetNotificationTemplatesQuery(
      channelId,
      eventType,
      resourceType,
      categoryId,
      isActive,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    const { templates, total } = result;
    return ResponseUtil.paginated(templates, total, page, limit, 'Notification templates retrieved successfully') as SuccessResponseDto<NotificationTemplateDto[]>;
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_BY_ID)
  @ApiOperation({ summary: 'Get notification template by ID' })
  @ApiParam({ name: 'id', description: 'Notification template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification template retrieved successfully', type: NotificationTemplateDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification template not found' })
  async getNotificationTemplateById(@Param('id') id: string): Promise<ApiResponseBookly<NotificationTemplateDto | null>> {
    const query = new GetNotificationTemplateByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Notification template retrieved successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_DEFAULT_SEARCH)
  @ApiOperation({ summary: 'Get default notification template for scope' })
  @ApiQuery({ name: 'channelId', required: true, description: 'Channel ID' })
  @ApiQuery({ name: 'eventType', required: true, enum: NotificationEventType, description: 'Event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Default notification template retrieved successfully', type: NotificationTemplateDto })
  async getDefaultNotificationTemplate(
    @Query('channelId') channelId: string,
    @Query('eventType') eventType: NotificationEventType,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string
  ): Promise<ApiResponseBookly<NotificationTemplateDto | null>> {
    const query = new GetDefaultNotificationTemplateQuery(
      channelId,
      eventType,
      resourceType,
      categoryId
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Default notification template retrieved successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_VARIABLES)
  @ApiOperation({ summary: 'Get notification template variables' })
  @ApiParam({ name: 'id', description: 'Notification template ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification template variables retrieved successfully' })
  async getNotificationTemplateVariables(@Param('id') id: string): Promise<any> {
    const query = new GetNotificationTemplateVariablesQuery(id);
    return await this.queryBus.execute(query);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_AVAILABLE_VARIABLES)
  @ApiOperation({ summary: 'Get available notification variables' })
  @ApiQuery({ name: 'eventType', required: true, enum: NotificationEventType, description: 'Event type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Available notification variables retrieved successfully' })
  async getAvailableNotificationVariables(
    @Query('eventType') eventType: NotificationEventType,
    @Query('resourceType') resourceType?: string
  ): Promise<any> {
    const query = new GetAvailableNotificationVariablesQuery(eventType, resourceType);
    return await this.queryBus.execute(query);
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_CONFIGS)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create notification config' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Notification config created successfully', type: NotificationConfigDto })
  @SwaggerApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createNotificationConfig(
    @Body() dto: CreateNotificationConfigDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<NotificationConfigDto>> {
    const command = new CreateNotificationConfigCommand(
      dto.programId,
      dto.resourceType,
      dto.categoryId,
      dto.channelId,
      dto.isEnabled,
      dto.isImmediate,
      dto.batchInterval,
      dto.sendDocuments,
      dto.documentMethod,
      user.id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification config created successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CONFIGS)
  @ApiOperation({ summary: 'Get notification configs' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'channelId', required: false, description: 'Filter by channel ID' })
  @ApiQuery({ name: 'isEnabled', required: false, description: 'Filter by enabled status' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification configs retrieved successfully', type: [NotificationConfigDto] })
  async getNotificationConfigs(
    @Query('programId') programId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('channelId') channelId?: string,
    @Query('isEnabled') isEnabled?: boolean
  ): Promise<ApiResponseBookly<NotificationConfigDto[]>> {
    const query = new GetNotificationConfigsQuery(
      programId,
      resourceType,
      categoryId,
      channelId,
      isEnabled
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Notification configs retrieved successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_CONFIGS_BY_ID)
  @ApiOperation({ summary: 'Get notification config by ID' })
  @ApiParam({ name: 'id', description: 'Notification config ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification config retrieved successfully', type: NotificationConfigDto })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification config not found' })
  async getNotificationConfigById(@Param('id') id: string): Promise<ApiResponseBookly<NotificationConfigDto | null>> {
    const query = new GetNotificationConfigByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Notification config retrieved successfully');
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SEND)
  @ApiOperation({ summary: 'Send notification' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, description: 'Notification sent successfully', type: SentNotificationDto })
  async sendNotification(
    @Body() dto: SendNotificationDto
  ): Promise<ApiResponseBookly<SentNotificationDto>> {
    const command = new SendNotificationCommand(
      dto.channel,
      dto.templateId,
      dto.reservationId,
      dto.recipientId,
      dto.variables,
      dto.hasAttachment,
      dto.attachmentPath
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification sent successfully');
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SEND_BATCH)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Send batch notifications' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Batch notifications sent successfully' })
  async sendBatchNotifications(
    @Body() body: { channelId: string; notificationIds: string[] }
  ): Promise<void> {
    const command = new SendBatchNotificationsCommand(
      body.channelId,
      body.notificationIds
    );
    return await this.commandBus.execute(command);
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SENT_BY_RESERVATION)
  @ApiOperation({ summary: 'Get sent notifications by reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Sent notifications retrieved successfully', type: [SentNotificationDto] })
  async getSentNotificationsByReservation(
    @Param('reservationId') reservationId: string
  ): Promise<ApiResponseBookly<SentNotificationDto[]>> {
    const query = new GetSentNotificationsByReservationQuery(reservationId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Sent notifications retrieved successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_SENT_BY_RECIPIENT)
  @ApiOperation({ summary: 'Get sent notifications by recipient' })
  @ApiParam({ name: 'recipientId', description: 'Recipient ID' })
  @ApiQuery({ name: 'channel', required: false, enum: NotificationChannelType, description: 'Filter by channel' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Sent notifications retrieved successfully' })
  async getSentNotificationsByRecipient(
    @Param('recipientId') recipientId: string,
    @Query('channel') channel?: NotificationChannelType,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<ApiResponseBookly<SentNotificationDto[]>> {
    const query = new GetSentNotificationsByRecipientQuery(
      recipientId,
      channel,
      status,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    const { notifications, total } = result;
    return ResponseUtil.paginated(notifications, total, page, limit, 'Sent notifications retrieved successfully') as SuccessResponseDto<SentNotificationDto[]>;
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_PENDING)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pending notifications' })
  @ApiQuery({ name: 'channelId', required: false, description: 'Filter by channel ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Pending notifications retrieved successfully', type: [SentNotificationDto] })
  async getPendingNotifications(
    @Query('channelId') channelId?: string
  ): Promise<ApiResponseBookly<SentNotificationDto[]>> {
    const query = new GetPendingNotificationsQuery(channelId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Pending notifications retrieved successfully');
  }

  @Get(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_BATCH)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get notifications for batch processing' })
  @ApiParam({ name: 'channelId', description: 'Channel ID' })
  @ApiQuery({ name: 'batchInterval', required: true, description: 'Batch interval in milliseconds', type: Number })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notifications for batch retrieved successfully', type: [SentNotificationDto] })
  async getNotificationsForBatch(
    @Param('channelId') channelId: string,
    @Query('batchInterval') batchInterval: number
  ): Promise<ApiResponseBookly<SentNotificationDto[]>> {
    const query = new GetNotificationsForBatchQuery(channelId, batchInterval);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Notifications for batch retrieved successfully');
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_TEMPLATE_MARK_READ)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @SwaggerApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read successfully' })
  async markNotificationAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<void>> {
    const command = new MarkNotificationAsReadCommand(id, user.id);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification marked as read successfully');
  }
}
