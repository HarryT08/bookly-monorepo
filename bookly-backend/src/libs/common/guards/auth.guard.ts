/**
 * Auth Guard
 * Basic authentication guard for protecting routes
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    // Basic token validation - in real implementation, validate JWT
    if (!this.validateToken(token)) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request (in real implementation, decode JWT)
    (request as any).user = this.getUserFromToken(token);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validateToken(token: string): boolean {
    // TODO: Implement actual JWT validation
    // For now, just check if token exists and is not empty
    return token && token.length > 0;
  }

  private getUserFromToken(token: string): any {
    // TODO: Implement actual JWT decoding
    // For now, return a mock user
    return {
      id: 'user-123',
      email: 'user@example.com',
      role: 'USER',
    };
  }
}
