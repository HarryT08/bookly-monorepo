import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@bookly-monorepo/logging';
import { User } from '../../domain/entities/user.entity';

// Extender la interfaz de Express Request para incluir la propiedad user
declare module 'express' {
  interface Request {
    user?: Partial<User>;
  }
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user ?? {};
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
