import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';

/**
 * Middleware para RF-42: Auditoría completa de modificaciones de recursos
 * Registra todas las operaciones de modificación en recursos del sistema
 */
@Injectable()
export class ResourceAuditMiddleware implements NestMiddleware {
  constructor(private loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.url;
    const user = (req as any).user;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const startTime = Date.now();

    // Solo auditar operaciones de modificación en recursos
    const isResourceModification = this.isResourceEndpoint(url) && 
                                  ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (!isResourceModification) {
      return next();
    }

    // Auditar inicio de operación
    this.loggingService.log(
      'Resource modification operation started',
      LoggingHelper.logParams({
        userId: user?.id,
        email: user?.email,
        ipAddress,
        userAgent,
        method,
        url,
        timestamp: new Date().toISOString(),
        resourceType: this.extractResourceType(url),
        resourceId: this.extractResourceId(url),
      }),
    );

    // Interceptar la respuesta para auditar el resultado
    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const statusCode = res.statusCode;

      // Auditar resultado de la operación
      if (statusCode >= 200 && statusCode < 300) {
        // Operación exitosa
        this.loggingService.log(
          'Resource modification completed successfully',
          LoggingHelper.logParams({
            userId: user?.id,
            email: user?.email,
            ipAddress,
            method,
            url,
            statusCode,
            duration,
            resourceType: this.extractResourceType(url),
            resourceId: this.extractResourceId(url),
            timestamp: new Date().toISOString(),
          }),
        );
      } else {
        // Operación fallida
        this.loggingService.warn(
          'Resource modification failed',
          LoggingHelper.logParams({
            userId: user?.id,
            email: user?.email,
            ipAddress,
            method,
            url,
            statusCode,
            duration,
            resourceType: this.extractResourceType(url),
            resourceId: this.extractResourceId(url),
            timestamp: new Date().toISOString(),
            error: data ? JSON.stringify(data).substring(0, 500) : 'Unknown error',
          }),
        );
      }

      return originalSend.call(this, data);
    }.bind(this);

    next();
  }

  /**
   * Determina si la URL corresponde a un endpoint de recursos
   */
  private isResourceEndpoint(url: string): boolean {
    const resourcePatterns = [
      '/resources',
      '/rooms',
      '/equipment',
      '/facilities',
      '/spaces',
      '/assets',
    ];

    return resourcePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Extrae el tipo de recurso de la URL
   */
  private extractResourceType(url: string): string {
    const match = url.match(/\/(resources|rooms|equipment|facilities|spaces|assets)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Extrae el ID del recurso de la URL
   */
  private extractResourceId(url: string): string | null {
    const match = url.match(/\/([a-f\d-]{24,36})(?:\/|$)/i);
    return match ? match[1] : null;
  }
}
