/**
 * Notification Service
 * Handles automatic notifications for availability service events
 * Integrates with multiple channels: Email, SMS, Push, In-App
 */

import { Injectable } from "@nestjs/common";
import { LoggingService } from "@logging/logging.service";
import { EventBusService } from "@event-bus/services/event-bus.service";
import { LoggingHelper } from "@logging/logging.helper";
import { NotificationPriority } from "../../utils";
import { NotificationChannelType } from "../../utils";

// Notification interfaces
export interface NotificationChannel {
  type: NotificationChannelType;
  enabled: boolean;
  priority: NotificationPriority;
  config?: any;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  eventType: string;
  channel: NotificationChannelType;
  language: string;
  subject?: string;
  title?: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  metadata?: any;
}

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  pushTokens?: string[];
  preferredLanguage: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    whatsapp: boolean;
  };
  timezone: string;
}

export interface NotificationPayload {
  eventType: string;
  eventId: string;
  aggregateId: string;
  priority: NotificationPriority;
  recipients: NotificationRecipient[];
  templateVariables: Record<string, any>;
  channels: NotificationChannel[];
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: any;
}

export interface NotificationResult {
  notificationId: string;
  eventId: string;
  status: "SENT" | "PENDING" | "FAILED" | "SCHEDULED";
  channelResults: Array<{
    channel: NotificationChannelType;
    status: "SUCCESS" | "FAILED" | "PENDING";
    recipientId: string;
    messageId?: string;
    error?: string;
    sentAt?: Date;
    deliveredAt?: Date;
  }>;
  totalSent: number;
  totalFailed: number;
  createdAt: Date;
  processedAt?: Date;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: LoggingService,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Send notification to multiple recipients across multiple channels
   */
  async sendNotification(
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log("Sending notification", {
      notificationId,
      eventType: payload.eventType,
      eventId: payload.eventId,
      recipientCount: payload.recipients.length,
      channels: payload.channels.map((c) => c.type),
    });

    const result: NotificationResult = {
      notificationId,
      eventId: payload.eventId,
      status: "PENDING",
      channelResults: [],
      totalSent: 0,
      totalFailed: 0,
      createdAt: new Date(),
    };

    try {
      // Process each recipient
      for (const recipient of payload.recipients) {
        await this.processRecipientNotifications(recipient, payload, result);
      }

      // Update final status
      result.status =
        result.totalFailed === 0
          ? "SENT"
          : result.totalSent === 0
            ? "FAILED"
            : "SENT";
      result.processedAt = new Date();

      // Publish notification result event
      await this.publishNotificationResultEvent(result, payload);

      this.logger.log("Notification processing completed", {
        notificationId,
        status: result.status,
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
      });

      return result;
    } catch (error) {
      this.logger.error(
        "Failed to send notification",
        error,
        LoggingHelper.logParams({
          notificationId,
          eventType: payload.eventType,
          eventId: payload.eventId,
        })
      );

      result.status = "FAILED";
      result.processedAt = new Date();
      return result;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(
    recipient: NotificationRecipient,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!recipient.email) {
        return { success: false, error: "No email address provided" };
      }

      // Replace template variables
      const subject = this.replaceTemplateVariables(
        template.subject || "",
        variables
      );
      const body = this.replaceTemplateVariables(template.body, variables);
      const htmlBody = template.htmlBody
        ? this.replaceTemplateVariables(template.htmlBody, variables)
        : undefined;

      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      const emailPayload = {
        to: recipient.email,
        subject,
        text: body,
        html: htmlBody,
        templateId: template.id,
        variables,
      };

      this.logger.log("Sending email notification", {
        recipient: recipient.email,
        template: template.id,
        subject,
      });

      // Simulate email sending (replace with actual implementation)
      const messageId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Publish email sent event
      await this.eventBus.publishEvent({
        eventId: `email-sent-${Date.now()}`,
        eventType: "EmailNotificationSent",
        aggregateId: recipient.userId,
        aggregateType: "Notification",
        timestamp: new Date(),
        eventData: {
          recipient: recipient.email,
          subject,
          messageId,
          templateId: template.id,
        },
        version: 1,
      });

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        "Failed to send email notification",
        error,
        LoggingHelper.logParams({
          recipient: recipient.email,
          template: template.id,
        })
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMSNotification(
    recipient: NotificationRecipient,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!recipient.phone) {
        return { success: false, error: "No phone number provided" };
      }

      // Replace template variables
      const message = this.replaceTemplateVariables(template.body, variables);

      // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
      const smsPayload = {
        to: recipient.phone,
        body: message,
        templateId: template.id,
      };

      this.logger.log("Sending SMS notification", {
        recipient: recipient.phone,
        template: template.id,
        messageLength: message.length,
      });

      // Simulate SMS sending (replace with actual implementation)
      const messageId = `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Publish SMS sent event
      await this.eventBus.publishEvent({
        eventId: `sms-sent-${Date.now()}`,
        eventType: "SMSNotificationSent",
        aggregateId: recipient.userId,
        aggregateType: "Notification",
        timestamp: new Date(),
        eventData: {
          recipient: recipient.phone,
          message,
          messageId,
          templateId: template.id,
        },
        version: 1,
      });

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        "Failed to send SMS notification",
        error,
        LoggingHelper.logParams({
          recipient: recipient.phone,
          template: template.id,
        })
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    recipient: NotificationRecipient,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!recipient.pushTokens || recipient.pushTokens.length === 0) {
        return { success: false, error: "No push tokens provided" };
      }

      // Replace template variables
      const title = this.replaceTemplateVariables(
        template.title || "",
        variables
      );
      const body = this.replaceTemplateVariables(template.body, variables);

      // TODO: Integrate with actual push service (Firebase, OneSignal, etc.)
      const pushPayload = {
        tokens: recipient.pushTokens,
        title,
        body,
        data: variables,
        templateId: template.id,
      };

      this.logger.log("Sending push notification", {
        recipient: recipient.userId,
        template: template.id,
        title,
        tokenCount: recipient.pushTokens.length,
      });

      // Simulate push sending (replace with actual implementation)
      const messageId = `push-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Publish push sent event
      await this.eventBus.publishEvent({
        eventId: `push-sent-${Date.now()}`,
        eventType: "PushNotificationSent",
        aggregateId: recipient.userId,
        aggregateType: "Notification",
        timestamp: new Date(),
        eventData: {
          recipient: recipient.userId,
          title,
          body,
          messageId,
          templateId: template.id,
          tokenCount: recipient.pushTokens.length,
        },
        version: 1,
      });

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        "Failed to send push notification",
        error,
        LoggingHelper.logParams({
          recipient: recipient.userId,
          template: template.id,
        })
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(
    recipient: NotificationRecipient,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Replace template variables
      const title = this.replaceTemplateVariables(
        template.title || "",
        variables
      );
      const body = this.replaceTemplateVariables(template.body, variables);

      // TODO: Store in-app notification in database
      const inAppPayload = {
        userId: recipient.userId,
        title,
        body,
        data: variables,
        templateId: template.id,
        read: false,
        createdAt: new Date(),
      };

      this.logger.log("Sending in-app notification", {
        recipient: recipient.userId,
        template: template.id,
        title,
      });

      // Simulate in-app notification storage (replace with actual implementation)
      const messageId = `inapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Publish in-app notification event
      await this.eventBus.publishEvent({
        eventId: `inapp-created-${Date.now()}`,
        eventType: "InAppNotificationCreated",
        aggregateId: recipient.userId,
        aggregateType: "Notification",
        timestamp: new Date(),
        eventData: {
          recipient: recipient.userId,
          title,
          body,
          messageId,
          templateId: template.id,
        },
        version: 1,
      });

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        "Failed to send in-app notification",
        error,
        LoggingHelper.logParams({
          recipient: recipient.userId,
          template: template.id,
        })
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification template by event type and channel
   */
  async getNotificationTemplate(
    eventType: string,
    channel: string,
    language: string = "es"
  ): Promise<NotificationTemplate | null> {
    try {
      // TODO: Load from database or configuration
      // This is a simplified implementation
      const templates = await this.loadNotificationTemplates();

      return (
        templates.find(
          (t) =>
            t.eventType === eventType &&
            t.channel === channel &&
            t.language === language
        ) || null
      );
    } catch (error) {
      this.logger.error(
        "Failed to get notification template",
        error,
        LoggingHelper.logParams({
          eventType,
          channel,
          language,
        })
      );
      return null;
    }
  }

  /**
   * Process notifications for a single recipient
   */
  private async processRecipientNotifications(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    result: NotificationResult
  ): Promise<void> {
    for (const channel of payload.channels) {
      // Check if recipient has this channel enabled
      const channelEnabled = this.isChannelEnabledForRecipient(
        recipient,
        channel.type
      );

      if (!channelEnabled) {
        this.logger.debug(
          "Channel disabled for recipient",
          LoggingHelper.logParams({
            recipient: recipient.userId,
            channel: channel.type,
          })
        );
        continue;
      }

      // Get template for this channel
      const template = await this.getNotificationTemplate(
        payload.eventType,
        channel.type,
        recipient.preferredLanguage
      );

      if (!template) {
        this.logger.warn(
          "No template found for notification",
          LoggingHelper.logParams({
            eventType: payload.eventType,
            channel: channel.type,
            language: recipient.preferredLanguage,
          })
        );
        continue;
      }

      // Send notification via channel
      let channelResult: any;

      switch (channel.type) {
        case NotificationChannelType.EMAIL:
          channelResult = await this.sendEmailNotification(
            recipient,
            template,
            payload.templateVariables
          );
          break;
        case NotificationChannelType.SMS:
          channelResult = await this.sendSMSNotification(
            recipient,
            template,
            payload.templateVariables
          );
          break;
        case NotificationChannelType.PUSH:
          channelResult = await this.sendPushNotification(
            recipient,
            template,
            payload.templateVariables
          );
          break;
        case NotificationChannelType.IN_APP:
          channelResult = await this.sendInAppNotification(
            recipient,
            template,
            payload.templateVariables
          );
          break;
        default:
          this.logger.warn("Unsupported notification channel", {
            channel: channel.type,
          });
          continue;
      }

      // Record result
      result.channelResults.push({
        channel: channel.type,
        status: channelResult.success ? "SUCCESS" : "FAILED",
        recipientId: recipient.userId,
        messageId: channelResult.messageId,
        error: channelResult.error,
        sentAt: channelResult.success ? new Date() : undefined,
      });

      if (channelResult.success) {
        result.totalSent++;
      } else {
        result.totalFailed++;
      }
    }
  }

  /**
   * Check if a notification channel is enabled for a recipient
   */
  private isChannelEnabledForRecipient(
    recipient: NotificationRecipient,
    channelType: string
  ): boolean {
    switch (channelType) {
      case NotificationChannelType.EMAIL:
        return recipient.preferences.email && !!recipient.email;
      case NotificationChannelType.SMS:
        return recipient.preferences.sms && !!recipient.phone;
      case NotificationChannelType.PUSH:
        return recipient.preferences.push && !!recipient.pushTokens?.length;
      case NotificationChannelType.IN_APP:
        return recipient.preferences.inApp;
      case NotificationChannelType.WHATSAPP:
        return recipient.preferences.whatsapp && !!recipient.phone;
      default:
        return false;
    }
  }

  /**
   * Replace template variables in text
   */
  private replaceTemplateVariables(
    text: string,
    variables: Record<string, any>
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Load notification templates (placeholder implementation)
   */
  private async loadNotificationTemplates(): Promise<NotificationTemplate[]> {
    // TODO: Load from database or configuration file
    // This is a simplified implementation with some example templates
    return [
      {
        id: "recurring-reservation-created-email",
        name: "Recurring Reservation Created - Email",
        eventType: "RecurringReservationCreated",
        channel: NotificationChannelType.EMAIL,
        language: "es",
        subject: "Reserva Periódica Creada: {{title}}",
        body: 'Su reserva periódica "{{title}}" ha sido creada exitosamente para el recurso {{resourceName}}.',
        htmlBody:
          '<h2>Reserva Periódica Creada</h2><p>Su reserva periódica "<strong>{{title}}</strong>" ha sido creada exitosamente para el recurso <strong>{{resourceName}}</strong>.</p>',
        variables: [
          "title",
          "resourceName",
          "startDate",
          "endDate",
          "frequency",
        ],
      },
      {
        id: "waiting-list-slot-available-sms",
        name: "Waiting List Slot Available - SMS",
        eventType: "WaitingListSlotAvailable",
        channel: NotificationChannelType.SMS,
        language: "es",
        body: "BOOKLY: Hay un espacio disponible para {{resourceName}} el {{slotDate}}. Confirme en 10 minutos.",
        variables: ["resourceName", "slotDate", "slotTime"],
      },
      {
        id: "reassignment-request-created-push",
        name: "Reassignment Request Created - Push",
        eventType: "ReassignmentRequestCreated",
        channel: NotificationChannelType.PUSH,
        language: "es",
        title: "Solicitud de Reasignación",
        body: "Se ha creado una solicitud de reasignación para su reserva en {{resourceName}}.",
        variables: ["resourceName", "reason", "newResourceName"],
      },
    ];
  }

  /**
   * Publish notification result event
   */
  private async publishNotificationResultEvent(
    result: NotificationResult,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      await this.eventBus.publishEvent({
        eventId: `NotificationProcessed-${Date.now()}`,
        eventType: "notification-processed",
        aggregateId: result.notificationId,
        aggregateType: "Notification",
        timestamp: new Date(),
        eventData: {
          notificationId: result.notificationId,
          originalEventType: payload.eventType,
          originalEventId: payload.eventId,
          status: result.status,
          totalSent: result.totalSent,
          totalFailed: result.totalFailed,
          channelResults: result.channelResults,
        },
        version: 1,
      });
    } catch (error) {
      this.logger.error(
        "Failed to publish notification result event",
        error,
        LoggingHelper.logParams({
          notificationId: result.notificationId,
        })
      );
    }
  }
}
