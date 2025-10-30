/**
 * Notification Template Repository
 * Manages notification templates for different events and channels
 * Supports multi-language templates and customization
 */

import { Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { NotificationChannelType } from '../../utils/notification-channel-type.enum';
import { NotificationTemplate } from '../services/notification.service';
import { LoggingHelper } from '@logging/logging.helper';

@Injectable()
export class NotificationTemplateRepository {
  constructor(private readonly logger: LoggingService) {}

  /**
   * Get notification template by criteria
   */
  async getTemplate(
    eventType: string,
    channel: string,
    language: string = 'es',
    programId?: string
  ): Promise<NotificationTemplate | null> {
    try {
      // TODO: Replace with actual database query
      const templates = await this.getAllTemplates();
      
      // First try to find program-specific template
      if (programId) {
        const programTemplate = templates.find(t => 
          t.eventType === eventType && 
          t.channel === channel && 
          t.language === language &&
          t.metadata?.programId === programId
        );
        
        if (programTemplate) {
          return programTemplate;
        }
      }
      
      // Fallback to general template
      return templates.find(t => 
        t.eventType === eventType && 
        t.channel === channel && 
        t.language === language &&
        !t.metadata?.programId
      ) || null;

    } catch (error) {
      this.logger.error('Failed to get notification template', error, LoggingHelper.logParams({
        eventType,
        channel,
        language,
        programId
      }));
      return null;
    }
  }

  /**
   * Get all templates for an event type
   */
  async getTemplatesByEventType(eventType: string): Promise<NotificationTemplate[]> {
    try {
      const templates = await this.getAllTemplates();
      return templates.filter(t => t.eventType === eventType);
    } catch (error) {
      this.logger.error('Failed to get templates by event type', error, LoggingHelper.logParams({ eventType }));
      return [];
    }
  }

  /**
   * Create or update notification template
   */
  async saveTemplate(template: NotificationTemplate): Promise<void> {
    try {
      // TODO: Implement actual database save
      this.logger.log('Saving notification template', {
        templateId: template.id,
        eventType: template.eventType,
        channel: template.channel,
        language: template.language
      });
      
      // Validate template
      this.validateTemplate(template);
      
      // Save to database (placeholder)
      // await this.prisma.notificationTemplate.upsert(...)
      
    } catch (error) {
      this.logger.error('Failed to save notification template', error, LoggingHelper.logParams({ templateId: template.id }));
      throw error;
    }
  }

  /**
   * Delete notification template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      // TODO: Implement actual database delete
      this.logger.log('Deleting notification template', LoggingHelper.logParams({ templateId }));
      
      // await this.prisma.notificationTemplate.delete({ where: { id: templateId } })
      
    } catch (error) {
      this.logger.error('Failed to delete notification template', error, LoggingHelper.logParams({ templateId }));
      throw error;
    }
  }

  /**
   * Get all notification templates (placeholder implementation)
   */
  private async getAllTemplates(): Promise<NotificationTemplate[]> {
    // TODO: Replace with actual database query
    return [
      // Recurring Reservation Templates
      {
        id: 'recurring-reservation-created-email-es',
        name: 'Reserva Periódica Creada - Email',
        eventType: 'RecurringReservationCreated',
        channel: NotificationChannelType.EMAIL,
        language: 'es',
        subject: '✅ Reserva Periódica Creada: {{title}}',
        body: 'Su reserva periódica "{{title}}" ha sido creada exitosamente para el recurso {{resourceName}}.\n\nDetalles:\n- Frecuencia: {{frequency}}\n- Horario: {{startTime}} - {{endTime}}\n- Período: {{startDate}} - {{endDate}}\n- Total de instancias: {{totalInstances}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">✅ Reserva Periódica Creada</h2>
            <p>Su reserva periódica "<strong>{{title}}</strong>" ha sido creada exitosamente para el recurso <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Detalles de la Reserva:</h3>
              <ul>
                <li><strong>Frecuencia:</strong> {{frequency}}</li>
                <li><strong>Horario:</strong> {{startTime}} - {{endTime}}</li>
                <li><strong>Período:</strong> {{startDate}} - {{endDate}}</li>
                <li><strong>Total de instancias:</strong> {{totalInstances}}</li>
              </ul>
            </div>
            <p style="color: #666;">Recibirá notificaciones antes de cada sesión programada.</p>
          </div>
        `,
        variables: ['title', 'resourceName', 'startDate', 'endDate', 'frequency', 'startTime', 'endTime', 'totalInstances']
      },
      
      {
        id: 'recurring-reservation-conflict-email-es',
        name: 'Conflicto en Reserva Periódica - Email',
        eventType: 'RecurringReservationConflictDetected',
        channel: NotificationChannelType.EMAIL,
        language: 'es',
        subject: '⚠️ Conflicto Detectado: {{title}}',
        body: 'Se han detectado {{totalConflicts}} conflictos en su reserva periódica "{{title}}" para el recurso {{resourceName}}.\n\nFechas afectadas: {{conflictDates}}\n\nAcciones sugeridas: {{suggestedActions}}\n\n¿Requiere resolución manual? {{resolutionRequired}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">⚠️ Conflicto Detectado</h2>
            <p>Se han detectado <strong>{{totalConflicts}} conflictos</strong> en su reserva periódica "<strong>{{title}}</strong>" para el recurso <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
              <h3>Fechas Afectadas:</h3>
              <p>{{conflictDates}}</p>
              <h3>Acciones Sugeridas:</h3>
              <p>{{suggestedActions}}</p>
              <h3>¿Requiere resolución manual?</h3>
              <p><strong>{{resolutionRequired}}</strong></p>
            </div>
            <p style="color: #666;">Por favor, revise y tome las acciones necesarias para resolver estos conflictos.</p>
          </div>
        `,
        variables: ['title', 'resourceName', 'totalConflicts', 'conflictDates', 'suggestedActions', 'resolutionRequired']
      },

      // Waiting List Templates
      {
        id: 'waiting-list-slot-available-sms-es',
        name: 'Espacio Disponible - SMS',
        eventType: 'WaitingListSlotAvailable',
        channel: NotificationChannelType.SMS,
        language: 'es',
        body: '🎯 BOOKLY: Espacio disponible para {{resourceName}} el {{slotDate}} a las {{slotTime}}. Posición #{{position}}. Confirme en {{confirmationTimeLimit}} minutos. Tiempo de espera: {{waitTime}}h.',
        variables: ['resourceName', 'slotDate', 'slotTime', 'position', 'waitTime', 'confirmationTimeLimit']
      },

      {
        id: 'waiting-list-slot-available-push-es',
        name: 'Espacio Disponible - Push',
        eventType: 'WaitingListSlotAvailable',
        channel: NotificationChannelType.PUSH,
        language: 'es',
        title: '🎯 Espacio Disponible!',
        body: '{{resourceName}} disponible el {{slotDate}}. Confirme ahora!',
        variables: ['resourceName', 'slotDate', 'slotTime']
      },

      {
        id: 'waiting-list-slot-available-email-es',
        name: 'Espacio Disponible - Email',
        eventType: 'WaitingListSlotAvailable',
        channel: NotificationChannelType.EMAIL,
        language: 'es',
        subject: '🎯 Espacio Disponible: {{resourceName}}',
        body: '¡Excelentes noticias! Hay un espacio disponible para {{resourceName}} el {{slotDate}} a las {{slotTime}}.\n\nUsted está en la posición #{{position}} y ha esperado {{waitTime}} horas.\n\nTiene {{confirmationTimeLimit}} minutos para confirmar su reserva.',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">🎯 ¡Espacio Disponible!</h2>
            <p>¡Excelentes noticias! Hay un espacio disponible para <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
              <h3>Detalles del Espacio:</h3>
              <ul>
                <li><strong>Fecha:</strong> {{slotDate}}</li>
                <li><strong>Hora:</strong> {{slotTime}}</li>
                <li><strong>Su posición:</strong> #{{position}}</li>
                <li><strong>Tiempo de espera:</strong> {{waitTime}} horas</li>
              </ul>
            </div>
            <div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; text-align: center;">
              <strong>⏰ Tiene {{confirmationTimeLimit}} minutos para confirmar</strong>
            </div>
          </div>
        `,
        variables: ['resourceName', 'slotDate', 'slotTime', 'position', 'waitTime', 'confirmationTimeLimit']
      },

      {
        id: 'user-joined-waiting-list-email-es',
        name: 'Unido a Lista de Espera - Email',
        eventType: 'UserJoinedWaitingList',
        channel: NotificationChannelType.EMAIL,
        language: 'es',
        subject: '📋 Agregado a Lista de Espera: {{resourceName}}',
        body: 'Ha sido agregado a la lista de espera para {{resourceName}}.\n\nPosición actual: #{{position}}\nPrioridad: {{priority}}\nTiempo estimado de espera: {{estimatedWaitTime}} minutos',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #17a2b8;">📋 Agregado a Lista de Espera</h2>
            <p>Ha sido agregado exitosamente a la lista de espera para <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Su Estado en la Lista:</h3>
              <ul>
                <li><strong>Posición actual:</strong> #{{position}}</li>
                <li><strong>Prioridad:</strong> {{priority}}</li>
                <li><strong>Tiempo estimado:</strong> {{estimatedWaitTime}} minutos</li>
              </ul>
            </div>
            <p style="color: #666;">Le notificaremos tan pronto como haya un espacio disponible.</p>
          </div>
        `,
        variables: ['resourceName', 'position', 'priority', 'estimatedWaitTime']
      },

      // Reassignment Templates
      {
        id: 'reassignment-request-created-email-es',
        name: 'Solicitud de Reasignación Creada - Email',
        eventType: 'ReassignmentRequestCreated',
        channel: NotificationChannelType.EMAIL,
        language: 'es',
        subject: '🔄 Solicitud de Reasignación: {{resourceName}}',
        body: 'Se ha creado una solicitud de reasignación para su reserva en {{resourceName}}.\n\nMotivo: {{reason}}\nPrioridad: {{priority}}\nRecurso sugerido: {{newResourceName}}\nFecha límite de respuesta: {{responseDeadline}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #fd7e14;">🔄 Solicitud de Reasignación</h2>
            <p>Se ha creado una solicitud de reasignación para su reserva en <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Detalles de la Solicitud:</h3>
              <ul>
                <li><strong>Motivo:</strong> {{reason}}</li>
                <li><strong>Prioridad:</strong> {{priority}}</li>
                <li><strong>Recurso sugerido:</strong> {{newResourceName}}</li>
                <li><strong>Fecha límite:</strong> {{responseDeadline}}</li>
              </ul>
            </div>
            <p style="color: #666;">Por favor, revise y responda a esta solicitud lo antes posible.</p>
          </div>
        `,
        variables: ['resourceName', 'reason', 'priority', 'newResourceName', 'responseDeadline']
      },

      {
        id: 'reassignment-request-created-sms-es',
        name: 'Solicitud de Reasignación Creada - SMS',
        eventType: 'ReassignmentRequestCreated',
        channel: NotificationChannelType.SMS,
        language: 'es',
        body: '🔄 BOOKLY: Solicitud de reasignación para {{resourceName}}. Motivo: {{reason}}. Nuevo recurso: {{newResourceName}}. Responda antes: {{responseDeadline}}',
        variables: ['resourceName', 'reason', 'newResourceName', 'responseDeadline']
      },

      {
        id: 'reassignment-applied-email-es',
        name: 'Reasignación Aplicada - Email',
        eventType: 'ReassignmentApplied',
        channel: NotificationChannelType.EMAIL,
        language: 'es',
        subject: '✅ Reasignación Completada: {{newResourceName}}',
        body: 'Su reserva ha sido reasignada exitosamente.\n\nNuevo recurso: {{newResourceName}}\nNuevo horario: {{newStartTime}} - {{newEndTime}}\nCompensación: {{compensationApplied}}\nID de nueva reserva: {{newReservationId}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">✅ Reasignación Completada</h2>
            <p>Su reserva ha sido reasignada exitosamente.</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Nueva Reserva:</h3>
              <ul>
                <li><strong>Recurso:</strong> {{newResourceName}}</li>
                <li><strong>Horario:</strong> {{newStartTime}} - {{newEndTime}}</li>
                <li><strong>Compensación:</strong> {{compensationApplied}}</li>
                <li><strong>ID de reserva:</strong> {{newReservationId}}</li>
              </ul>
            </div>
            <p style="color: #666;">Gracias por su paciencia durante el proceso de reasignación.</p>
          </div>
        `,
        variables: ['newResourceName', 'newStartTime', 'newEndTime', 'compensationApplied', 'newReservationId']
      },

      // English Templates
      {
        id: 'recurring-reservation-created-email-en',
        name: 'Recurring Reservation Created - Email',
        eventType: 'RecurringReservationCreated',
        channel: NotificationChannelType.EMAIL,
        language: 'en',
        subject: '✅ Recurring Reservation Created: {{title}}',
        body: 'Your recurring reservation "{{title}}" has been successfully created for resource {{resourceName}}.\n\nDetails:\n- Frequency: {{frequency}}\n- Schedule: {{startTime}} - {{endTime}}\n- Period: {{startDate}} - {{endDate}}\n- Total instances: {{totalInstances}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">✅ Recurring Reservation Created</h2>
            <p>Your recurring reservation "<strong>{{title}}</strong>" has been successfully created for resource <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Reservation Details:</h3>
              <ul>
                <li><strong>Frequency:</strong> {{frequency}}</li>
                <li><strong>Schedule:</strong> {{startTime}} - {{endTime}}</li>
                <li><strong>Period:</strong> {{startDate}} - {{endDate}}</li>
                <li><strong>Total instances:</strong> {{totalInstances}}</li>
              </ul>
            </div>
            <p style="color: #666;">You will receive notifications before each scheduled session.</p>
          </div>
        `,
        variables: ['title', 'resourceName', 'startDate', 'endDate', 'frequency', 'startTime', 'endTime', 'totalInstances']
      },

      {
        id: 'waiting-list-slot-available-email-en',
        name: 'Slot Available - Email',
        eventType: 'WaitingListSlotAvailable',
        channel: NotificationChannelType.EMAIL,
        language: 'en',
        subject: '🎯 Slot Available: {{resourceName}}',
        body: 'Great news! A slot is available for {{resourceName}} on {{slotDate}} at {{slotTime}}.\n\nYou are in position #{{position}} and have waited {{waitTime}} hours.\n\nYou have {{confirmationTimeLimit}} minutes to confirm your reservation.',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">🎯 Slot Available!</h2>
            <p>Great news! A slot is available for <strong>{{resourceName}}</strong>.</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
              <h3>Slot Details:</h3>
              <ul>
                <li><strong>Date:</strong> {{slotDate}}</li>
                <li><strong>Time:</strong> {{slotTime}}</li>
                <li><strong>Your position:</strong> #{{position}}</li>
                <li><strong>Wait time:</strong> {{waitTime}} hours</li>
              </ul>
            </div>
            <div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; text-align: center;">
              <strong>⏰ You have {{confirmationTimeLimit}} minutes to confirm</strong>
            </div>
          </div>
        `,
        variables: ['resourceName', 'slotDate', 'slotTime', 'position', 'waitTime', 'confirmationTimeLimit']
      }
    ];
  }

  /**
   * Validate notification template
   */
  private validateTemplate(template: NotificationTemplate): void {
    if (!template.id || !template.eventType || !template.channel || !template.language) {
      throw new Error('Template must have id, eventType, channel, and language');
    }

    if (!template.body) {
      throw new Error('Template must have a body');
    }

    if (template.channel === 'EMAIL' && !template.subject) {
      throw new Error('Email templates must have a subject');
    }

    if (template.channel === 'PUSH' && !template.title) {
      throw new Error('Push templates must have a title');
    }

    // Validate that all variables in the template are declared
    const bodyVariables = this.extractVariables(template.body);
    const subjectVariables = template.subject ? this.extractVariables(template.subject) : [];
    const titleVariables = template.title ? this.extractVariables(template.title) : [];
    const htmlVariables = template.htmlBody ? this.extractVariables(template.htmlBody) : [];
    
    const allUsedVariables = Array.from(new Set([
      ...bodyVariables,
      ...subjectVariables,
      ...titleVariables,
      ...htmlVariables
    ]));

    const missingVariables = allUsedVariables.filter(v => !template.variables.includes(v));
    
    if (missingVariables.length > 0) {
      throw new Error(`Template uses undeclared variables: ${missingVariables.join(', ')}`);
    }
  }

  /**
   * Extract variables from template text
   */
  private extractVariables(text: string): string[] {
    const regex = /\{\{\s*(\w+)\s*\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      variables.push(match[1]);
    }
    
    return Array.from(new Set(variables));
  }
}
