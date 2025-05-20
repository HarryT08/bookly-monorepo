/**
 * Interface base para todos los eventos del sistema
 */
export interface IEvent {
  /**
   * Nombre del evento
   */
  eventName: string;
  
  /**
   * Versión del evento
   */
  version: string;
  
  /**
   * Fecha de creación del evento
   */
  timestamp: Date;
  
  /**
   * ID de correlación para seguimiento de eventos relacionados
   */
  correlationId: string;
  
  /**
   * Datos del evento
   */
  payload: unknown;
}
