import 'reflect-metadata';
import { Injectable, Logger, Type } from '@nestjs/common';
import { IEvent } from '../interfaces/event.interface';

/**
 * Interfaz para los manejadores de eventos
 */
export interface IEventHandler<T extends IEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Decorador para marcar una clase como manejador de eventos
 */
export function EventHandler(eventName: string) {
  return function (target: any) {
    Reflect.defineMetadata('eventName', eventName, target);
  };
}

@Injectable()
export class EventSubscriber {
  private readonly logger = new Logger(EventSubscriber.name);
  private readonly eventHandlers = new Map<string, Set<Type<IEventHandler<IEvent>>>>();

  /**
   * Registra un manejador de eventos
   * @param handler Clase manejadora del evento
   */
  registerHandler(handler: Type<IEventHandler<IEvent>>): void {
    const eventName = Reflect.getMetadata('eventName', handler);
    
    if (!eventName) {
      throw new Error(`Handler ${handler.name} doesn't have an @EventHandler decorator`);
    }

    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }

    this.eventHandlers.get(eventName)?.add(handler);
    this.logger.debug(`Registered handler ${handler.name} for event ${eventName}`);
  }

  /**
   * Obtiene todos los manejadores para un evento
   * @param eventName Nombre del evento
   */
  getHandlers(eventName: string): Type<IEventHandler<IEvent>>[] {
    const handlers = this.eventHandlers.get(eventName);
    return handlers ? Array.from(handlers) : [];
  }

  /**
   * Procesa un evento invocando todos sus manejadores registrados
   * @param event Evento a procesar
   * @param container Contenedor de inyecciu00f3n de dependencias
   */
  async processEvent(event: IEvent, container: any): Promise<void> {
    const eventName = event.eventName;
    const handlers = this.getHandlers(eventName);

    if (handlers.length === 0) {
      this.logger.warn(`No handlers found for event ${eventName}`);
      return;
    }

    this.logger.debug(`Processing event ${eventName} with ${handlers.length} handlers`);
    
    for (const HandlerClass of handlers) {
      try {
        const handler = container.get(HandlerClass);
        await handler.handle(event);
      } catch (error) {
        this.logger.error(
          `Error processing event ${eventName} with handler ${HandlerClass.name}:`,
          error,
        );
      }
    }
  }
}
