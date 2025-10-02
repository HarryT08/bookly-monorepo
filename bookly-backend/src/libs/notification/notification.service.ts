import { Injectable } from '@nestjs/common';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly eventBusService: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Send real-time notification to a specific user
   */
  async sendNotification(notification: NotificationData): Promise<void> {
    this.loggingService.log(
      `Sending notification to user ${notification.userId}: ${notification.title}`,
      'NotificationService'
    );

    const notificationId = uuidv4();

    // Emit domain event for real-time WebSocket delivery
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'notification.sent',
      aggregateId: notificationId,
      aggregateType: 'Notification',
      eventData: {
        notificationId,
        recipientId: notification.userId,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        notificationType: notification.type,
        priority: notification.priority,
        data: notification.data,
        sentAt: new Date().toISOString(),
      },
      timestamp: new Date(),
      version: 1,
      userId: notification.userId,
    };

    await this.eventBusService.publishEvent(domainEvent);
  }

  /**
   * Send notification when reservation is created
   */
  async notifyReservationCreated(reservationId: string, userId: string, resourceName: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Reserva Creada',
      message: `Tu reserva para ${resourceName} ha sido creada exitosamente.`,
      type: 'success',
      priority: 'medium',
      data: { reservationId, resourceName },
    });
  }

  /**
   * Send notification when reservation is approved
   */
  async notifyReservationApproved(reservationId: string, userId: string, resourceName: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Reserva Aprobada',
      message: `Tu reserva para ${resourceName} ha sido aprobada.`,
      type: 'success',
      priority: 'high',
      data: { reservationId, resourceName },
    });
  }

  /**
   * Send notification when reservation is cancelled
   */
  async notifyReservationCancelled(reservationId: string, userId: string, resourceName: string, reason?: string): Promise<void> {
    const message = reason 
      ? `Tu reserva para ${resourceName} ha sido cancelada. Motivo: ${reason}`
      : `Tu reserva para ${resourceName} ha sido cancelada.`;

    await this.sendNotification({
      userId,
      title: 'Reserva Cancelada',
      message,
      type: 'warning',
      priority: 'high',  
      data: { reservationId, resourceName, reason },
    });
  }

  /**
   * Send notification when resource status changes
   */
  async notifyResourceUpdate(userId: string, resourceName: string, action: string): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Actualización de Recurso',
      message: `El recurso ${resourceName} ha sido ${action}.`,
      type: 'info',
      priority: 'low',
      data: { resourceName, action },
    });
  }

  /**
   * Send system maintenance notification
   */
  async notifySystemMaintenance(message: string, startTime: Date, endTime: Date): Promise<void> {
    // Emit system-wide notification (no specific user)
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'system.maintenance',
      aggregateId: 'system',
      aggregateType: 'System',
      eventData: {
        message,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        level: 'warning',
        systemComponent: 'maintenance',
      },
      timestamp: new Date(),
      version: 1,
    };

    await this.eventBusService.publishEvent(domainEvent);
  }
}
