/**
 * Notifications Controller
 * REST API for notification management and template configuration
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@libs/common/guards/jwt-auth.guard";
import { RolesGuard } from "@libs/common/guards/roles.guard";
import { Roles } from "@libs/common/decorators/roles.decorator";
import { CurrentUser } from "@libs/common/decorators/current-user.decorator";
import { LoggingService } from "@logging/logging.service";

// URL and Event Maps
import { AVAILABILITY_URLS } from "../../utils/maps/urls.map";
import { AVAILABILITY_EVENTS } from "../../utils/maps/events.map";

// Services
import {
  NotificationService,
  NotificationPayload,
  NotificationResult,
} from "../services/notification.service";
import { NotificationTemplateRepository } from "../repositories/notification-template.repository";

// DTOs
import { CreateNotificationDto } from "../dtos/create-notification.dto";
import { NotificationTemplateDto } from "../dtos/notification-template.dto";
import { CreateNotificationTemplateDto } from "../dtos/create-notification-template.dto";
import { UpdateNotificationTemplateDto } from "../dtos/update-notification-template.dto";
import { NotificationChannelType, NotificationPriority } from "../../utils";
import { UserRole } from "@/libs/common";
import { ResponseUtil } from "@/libs/common/utils/response.util";
import { ApiResponseBookly } from "@/libs/dto";
import { UserEntity } from "@/apps/auth-service/domain/entities/user.entity";

@ApiTags(AVAILABILITY_URLS.NOTIFICATION_TAG)
@Controller(AVAILABILITY_URLS.NOTIFICATION)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly templateRepository: NotificationTemplateRepository,
    private readonly logger: LoggingService
  ) {}

  /**
   * Send manual notification
   */
  @Post(AVAILABILITY_URLS.NOTIFICATION_SEND)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Send manual notification",
    description:
      "Send a notification to specific users through multiple channels",
  })
  @ApiResponse({
    status: 200,
    description: "Notification sent successfully",
    type: Object,
  })
  async sendNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<NotificationResult>> {
    this.logger.log("Manual notification request", {
      userId: user.id,
      eventType: createNotificationDto.eventType,
      recipientCount: createNotificationDto.recipients.length,
    });

    const payload: NotificationPayload = {
      eventType: AVAILABILITY_EVENTS.NOTIFICATION_SENT, // Using event map
      eventId: `manual-${Date.now()}`,
      aggregateId: createNotificationDto.aggregateId || "manual",
      priority: createNotificationDto.priority,
      recipients: createNotificationDto.recipients,
      templateVariables: createNotificationDto.templateVariables,
      channels: createNotificationDto.channels,
      scheduledAt: createNotificationDto.scheduledAt,
      expiresAt: createNotificationDto.expiresAt,
      metadata: {
        sentBy: user.id,
        manual: true,
        originalEventType: createNotificationDto.eventType,
      },
    };

    const result = await this.notificationService.sendNotification(payload);
    return ResponseUtil.success(result, "Notification sent successfully");
  }

  /**
   * Get notification templates
   */
  @Get(AVAILABILITY_URLS.NOTIFICATION_TEMPLATES)
  @ApiOperation({
    summary: "Get notification templates",
    description: "Retrieve notification templates with optional filtering",
  })
  @ApiQuery({
    name: "eventType",
    required: false,
    description: "Filter by event type",
  })
  @ApiQuery({
    name: "channel",
    required: false,
    description: "Filter by channel",
  })
  @ApiQuery({
    name: "language",
    required: false,
    description: "Filter by language",
  })
  @ApiResponse({
    status: 200,
    description: "Templates retrieved successfully",
    type: [NotificationTemplateDto],
  })
  async getTemplates(
    @Query("eventType") eventType?: string,
    @Query("channel") channel?: string,
    @Query("language") language?: string
  ): Promise<ApiResponseBookly<NotificationTemplateDto[]>> {
    this.logger.log("Getting notification templates", {
      eventType,
      channel,
      language,
    });

    if (eventType) {
      const templates =
        await this.templateRepository.getTemplatesByEventType(eventType);
      return ResponseUtil.success(
        templates
          .map((t) => {
            return {
              ...t,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          })
          .filter((t) => {
            if (channel && t.channel !== channel) return false;
            if (language && t.language !== language) return false;
            return true;
          }),
        "Templates retrieved successfully"
      );
    }

    // Get templates with filters - using public method
    if (eventType) {
      const templates =
        await this.templateRepository.getTemplatesByEventType(eventType);
      return ResponseUtil.success(
        templates
          .map((t) => {
            return {
              ...t,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          })
          .filter((t) => {
            if (channel && t.channel !== channel) return false;
            if (language && t.language !== language) return false;
            return true;
          }),
        "Templates retrieved successfully"
      );
    }

    // TODO: Implement getTemplatesWithFilters method in repository
    this.logger.warn(
      "Getting all templates without eventType filter not yet implemented"
    );
    return ResponseUtil.success([], "Templates retrieved successfully");
  }

  /**
   * Get specific template
   */
  @Get(AVAILABILITY_URLS.NOTIFICATION_TEMPLATES_BY_EVENT_TYPE)
  @ApiOperation({
    summary: "Get specific notification template",
    description:
      "Retrieve a specific template by event type, channel, and language",
  })
  @ApiParam({ name: "eventType", description: "Event type" })
  @ApiParam({ name: "channel", description: "Notification channel" })
  @ApiParam({ name: "language", description: "Template language" })
  @ApiResponse({
    status: 200,
    description: "Template retrieved successfully",
    type: NotificationTemplateDto,
  })
  @ApiResponse({
    status: 404,
    description: "Template not found",
  })
  async getTemplate(
    @Param("eventType") eventType: string,
    @Param("channel") channel: string,
    @Param("language") language: string,
    @Query("programId") programId?: string
  ): Promise<ApiResponseBookly<NotificationTemplateDto>> {
    this.logger.log("Getting specific notification template", {
      eventType,
      channel,
      language,
      programId,
    });

    const template = await this.templateRepository.getTemplate(
      eventType,
      channel,
      language,
      programId
    );

    if (!template) {
      throw new Error("Template not found");
    }

    return ResponseUtil.success(
      {
        ...template,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      "Template retrieved successfully"
    );
  }

  /**
   * Create notification template
   */
  @Post(AVAILABILITY_URLS.NOTIFICATION_TEMPLATES_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Create notification template",
    description: "Create a new notification template",
  })
  @ApiResponse({
    status: 201,
    description: "Template created successfully",
  })
  async createTemplate(
    @Body() createTemplateDto: CreateNotificationTemplateDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<boolean>> {
    this.logger.log("Creating notification template", {
      userId: user.id,
      eventType: createTemplateDto.eventType,
      channel: createTemplateDto.channel,
      language: createTemplateDto.language,
    });

    const template = {
      ...createTemplateDto,
      id: `${createTemplateDto.eventType}-${createTemplateDto.channel}-${createTemplateDto.language}`,
      metadata: {
        ...createTemplateDto.metadata,
        createdBy: user.id,
        createdAt: new Date(),
      },
    };

    await this.templateRepository.saveTemplate(template);
    return ResponseUtil.success(true, "Template created successfully");
  }

  /**
   * Update notification template
   */
  @Put(AVAILABILITY_URLS.NOTIFICATION_TEMPLATES_UPDATE)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Update notification template",
    description: "Update an existing notification template",
  })
  @ApiParam({ name: "templateId", description: "Template ID" })
  @ApiResponse({
    status: 200,
    description: "Template updated successfully",
  })
  async updateTemplate(
    @Param("templateId") templateId: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<boolean>> {
    this.logger.log("Updating notification template", {
      userId: user.id,
      templateId,
    });

    // TODO: Get existing template and merge with updates
    const updatedTemplate = {
      id: templateId,
      ...updateTemplateDto,
      metadata: {
        ...updateTemplateDto.metadata,
        updatedBy: user.id,
        updatedAt: new Date(),
      },
    };

    await this.templateRepository.saveTemplate(updatedTemplate as any);
    return ResponseUtil.success(true, "Template updated successfully");
  }

  /**
   * Delete notification template
   */
  @Delete(AVAILABILITY_URLS.NOTIFICATION_TEMPLATES_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Delete notification template",
    description: "Delete a notification template",
  })
  @ApiParam({ name: "templateId", description: "Template ID" })
  @ApiResponse({
    status: 204,
    description: "Template deleted successfully",
  })
  async deleteTemplate(
    @Param("templateId") templateId: string,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<boolean>> {
    this.logger.log("Deleting notification template", {
      userId: user.id,
      templateId,
    });

    await this.templateRepository.deleteTemplate(templateId);
    return ResponseUtil.success(true, "Template deleted successfully");
  }

  /**
   * Test notification template
   */
  @Post(AVAILABILITY_URLS.NOTIFICATION_TEMPLATES_TEST)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Test notification template",
    description: "Send a test notification using a specific template",
  })
  @ApiParam({ name: "templateId", description: "Template ID" })
  @ApiResponse({
    status: 200,
    description: "Test notification sent successfully",
  })
  async testTemplate(
    @Param("templateId") templateId: string,
    @Body()
    testData: {
      recipients: string[];
      templateVariables: Record<string, any>;
    },
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<NotificationResult>> {
    this.logger.log("Testing notification template", {
      userId: user.id,
      templateId,
      recipientCount: testData.recipients.length,
    });

    // TODO: Get template by ID and send test notification
    const payload: NotificationPayload = {
      eventType: AVAILABILITY_EVENTS.NOTIFICATION_SENT, // Using event map
      eventId: `test-${Date.now()}`,
      aggregateId: templateId,
      priority: NotificationPriority.LOW,
      recipients: [], // TODO: Convert recipient IDs to NotificationRecipient objects
      templateVariables: testData.templateVariables,
      channels: [
        {
          type: NotificationChannelType.EMAIL,
          enabled: true,
          priority: NotificationPriority.LOW,
        },
      ],
      metadata: {
        test: true,
        templateId,
        sentBy: user.id,
      },
    };

    const result = await this.notificationService.sendNotification(payload);
    return ResponseUtil.success(result, "Test notification sent successfully");
  }

  /**
   * Get notification statistics
   */
  @Get(AVAILABILITY_URLS.NOTIFICATION_STATS)
  @ApiOperation({
    summary: "Get notification statistics",
    description: "Retrieve notification delivery statistics",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date for statistics",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date for statistics",
  })
  @ApiQuery({
    name: "eventType",
    required: false,
    description: "Filter by event type",
  })
  @ApiQuery({
    name: "channel",
    required: false,
    description: "Filter by channel",
  })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  async getNotificationStats(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("eventType") eventType?: string,
    @Query("channel") channel?: string
  ): Promise<
    ApiResponseBookly<{
      totalSent: number;
      totalDelivered: number;
      totalFailed: number;
      deliveryRate: number;
      channelStats: Record<string, number>;
      eventTypeStats: Record<string, number>;
      timeSeriesData: any[];
    }>
  > {
    this.logger.log("Getting notification statistics", {
      startDate,
      endDate,
      eventType,
      channel,
    });

    // TODO: Implement notification statistics
    return ResponseUtil.success(
      {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        channelStats: {},
        eventTypeStats: {},
        timeSeriesData: [],
      },
      "Statistics retrieved successfully"
    );
  }

  /**
   * Get user notification preferences
   */
  @Get(AVAILABILITY_URLS.NOTIFICATION_PREFERENCES)
  @ApiOperation({
    summary: "Get user notification preferences",
    description: "Retrieve notification preferences for a specific user",
  })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "Preferences retrieved successfully",
  })
  async getUserPreferences(
    @Param("userId") userId: string,
    @CurrentUser() user: any
  ): Promise<
    ApiResponseBookly<{
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
      whatsapp: boolean;
      language: string;
      timezone: string;
    }>
  > {
    // Only allow users to see their own preferences or admins to see any
    if (user.id !== userId && !user.roles.some((r) => r.includes("ADMIN"))) {
      throw new Error("Unauthorized to view preferences");
    }

    this.logger.log("Getting user notification preferences", {
      requestingUserId: user.id,
      targetUserId: userId,
    });

    // TODO: Get user preferences from database
    return ResponseUtil.success(
      {
        email: true,
        sms: false,
        push: true,
        inApp: true,
        whatsapp: false,
        language: "es",
        timezone: "America/Bogota",
      },
      "Preferences retrieved successfully"
    );
  }

  /**
   * Update user notification preferences
   */
  @Put(AVAILABILITY_URLS.NOTIFICATION_PREFERENCES_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update user notification preferences",
    description: "Update notification preferences for a specific user",
  })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "Preferences updated successfully",
  })
  async updateUserPreferences(
    @Param("userId") userId: string,
    @Body()
    preferences: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      inApp?: boolean;
      whatsapp?: boolean;
      language?: string;
      timezone?: string;
    },
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<boolean>> {
    // Only allow users to update their own preferences or admins to update any
    if (user.id !== userId && !user.roles.some((r) => r.includes("ADMIN"))) {
      throw new Error("Unauthorized to update preferences");
    }

    this.logger.log("Updating user notification preferences", {
      requestingUserId: user.id,
      targetUserId: userId,
      preferences,
    });

    // TODO: Update user preferences in database
    return ResponseUtil.success(true, "Preferences updated successfully");
  }
}
