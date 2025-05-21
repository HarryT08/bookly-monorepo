/**
 * Interfaz genérica para respuestas de comandos
 * Sigue los principios de Clean Architecture separando la definición del tipo de su implementación
 */
export interface CommandResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  requestId: string;
  timestamp: Date;
}
