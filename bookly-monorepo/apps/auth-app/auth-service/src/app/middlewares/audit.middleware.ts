import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@bookly-monorepo/logging';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user || {};
    this.logger.info('AUDIT', {
      method: req.method,
      path: req.originalUrl,
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });
    next();
  }
}
