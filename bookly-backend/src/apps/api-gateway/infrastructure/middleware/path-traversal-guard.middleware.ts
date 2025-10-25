import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to detect and block Path Traversal attacks
 * Blocks requests with suspicious patterns like ../, ..\, %2e%2e, etc.
 */
@Injectable()
export class PathTraversalGuardMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PathTraversalGuardMiddleware.name);

  // Patterns that indicate path traversal attempts
  private readonly suspiciousPatterns = [
    /\.\./g,                    // ../
    /%2e%2e/gi,                 // URL encoded ../
    /%252e%252e/gi,             // Double URL encoded ../
    /\.\.%2f/gi,                // ..%2f (mixed encoding)
    /\.\.%5c/gi,                // ..\
    /%c0%ae%c0%ae/gi,           // UTF-8 overlong encoding
    /\.php$/i,                  // PHP files (we don't use PHP)
    /\.aspx$/i,                 // ASPX files (we don't use .NET)
    /\.jsp$/i,                  // JSP files (we don't use Java)
    /\.cgi$/i,                  // CGI files
    /\/etc\/passwd/i,           // Unix passwd file
    /\/windows\/system32/i,     // Windows system files
    /\/proc\/self/i,            // Linux proc filesystem
    /\/dev\/null/i,             // Device files
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const url = req.url;
    const path = req.path;

    // Check for suspicious patterns
    const hasSuspiciousPattern = this.suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(path)
    );

    if (hasSuspiciousPattern) {
      this.logger.warn(
        `🚨 Path Traversal attempt blocked: ${req.method} ${url}`,
        {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          url: url,
          path: path,
        }
      );

      // Return 400 Bad Request for suspicious requests
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad Request',
        error: 'Invalid path format',
      });
    }

    // Continue to next middleware
    next();
  }
}
