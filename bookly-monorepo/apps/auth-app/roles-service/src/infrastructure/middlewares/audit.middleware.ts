import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuditMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Log the request
    this.logger.log(
      `${method} ${originalUrl} - ${ip} - ${userAgent}`
    );

    // Track response time
    const startTime = Date.now();
    
    // Log once the response is sent
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      
      this.logger.log(
        `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`
      );
    });

    next();
  }
}
