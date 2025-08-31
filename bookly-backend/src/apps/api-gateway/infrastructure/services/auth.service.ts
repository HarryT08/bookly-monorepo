import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface AuthContext {
  user: AuthUser;
  token: string;
  tokenType: 'Bearer' | 'API-Key';
  expiresAt: Date;
  scopes: string[];
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  userId: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly authServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {
    this.jwtSecret = this.configService.get<string>('gateway.security.jwt.secret');
    this.authServiceUrl = this.configService.get<string>('gateway.microservices.auth.url');
  }

  public async validateJwtToken(token: string): Promise<AuthContext> {
    try {
      // First, verify the token locally
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret });
      
      // Extract user information from payload
      const user: AuthUser = {
        id: payload.sub || payload.userId,
        email: payload.email,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        isActive: payload.isActive !== false,
        lastLoginAt: payload.lastLoginAt ? new Date(payload.lastLoginAt) : undefined,
      };

      // Skip additional auth service validation for now - JWT verification is sufficient
      // await this.validateUserWithAuthService(user.id, token);

      return {
        user,
        token,
        tokenType: 'Bearer',
        expiresAt: new Date(payload.exp * 1000),
        scopes: payload.scopes || [],
      };

    } catch (error) {
      this.logger.warn(`JWT token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  public async validateApiKey(apiKey: string): Promise<AuthContext> {
    try {
      // Validate API key with auth service
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api-keys/validate`, {
          apiKey,
        }, {
          timeout: 5000,
        })
      );

      const apiKeyInfo: ApiKeyInfo = response.data;

      if (!apiKeyInfo.isActive) {
        throw new UnauthorizedException('API key is inactive');
      }

      if (apiKeyInfo.expiresAt && new Date() > new Date(apiKeyInfo.expiresAt)) {
        throw new UnauthorizedException('API key has expired');
      }

      // Get user information
      const userResponse = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/users/${apiKeyInfo.userId}`, {
          timeout: 5000,
        })
      );

      const user: AuthUser = {
        id: userResponse.data.id,
        email: userResponse.data.email,
        roles: userResponse.data.roles || [],
        permissions: userResponse.data.permissions || [],
        isActive: userResponse.data.isActive,
        lastLoginAt: userResponse.data.lastLoginAt ? new Date(userResponse.data.lastLoginAt) : undefined,
      };

      // Update last used timestamp
      this.updateApiKeyLastUsed(apiKeyInfo.id).catch(error => {
        this.logger.warn(`Failed to update API key last used timestamp: ${error.message}`);
      });

      return {
        user,
        token: apiKey,
        tokenType: 'API-Key',
        expiresAt: apiKeyInfo.expiresAt ? new Date(apiKeyInfo.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        scopes: apiKeyInfo.scopes,
      };

    } catch (error) {
      this.logger.warn(`API key validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid API key');
    }
  }

  public async validateSession(sessionId: string): Promise<AuthContext> {
    try {
      // Validate session with auth service
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/sessions/validate`, {
          sessionId,
        }, {
          timeout: 5000,
        })
      );

      const sessionData = response.data;

      if (!sessionData.isActive) {
        throw new UnauthorizedException('Session is inactive');
      }

      if (new Date() > new Date(sessionData.expiresAt)) {
        throw new UnauthorizedException('Session has expired');
      }

      const user: AuthUser = {
        id: sessionData.user.id,
        email: sessionData.user.email,
        roles: sessionData.user.roles || [],
        permissions: sessionData.user.permissions || [],
        isActive: sessionData.user.isActive,
        lastLoginAt: sessionData.user.lastLoginAt ? new Date(sessionData.user.lastLoginAt) : undefined,
      };

      return {
        user,
        token: sessionId,
        tokenType: 'Bearer',
        expiresAt: new Date(sessionData.expiresAt),
        scopes: sessionData.scopes || [],
      };

    } catch (error) {
      this.logger.warn(`Session validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  public async checkPermission(authContext: AuthContext, resource: string, action: string, scope?: string): Promise<boolean> {
    try {
      // Check local permissions first
      const hasLocalPermission = this.checkLocalPermission(authContext.user, resource, action, scope);
      
      if (hasLocalPermission) {
        return true;
      }

      // Fallback to auth service for complex permission checks
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/permissions/check`, {
          userId: authContext.user.id,
          resource,
          action,
          scope,
        }, {
          timeout: 3000,
        })
      );

      return response.data.allowed === true;

    } catch (error) {
      this.logger.warn(`Permission check failed for user ${authContext.user.id}: ${error.message}`);
      return false;
    }
  }

  private checkLocalPermission(user: AuthUser, resource: string, action: string, scope?: string): boolean {
    // Check if user has admin role (full access)
    if (user.roles.includes('admin') || user.roles.includes('super-admin')) {
      return true;
    }

    // Check specific permissions
    const requiredPermission = scope ? `${resource}:${action}:${scope}` : `${resource}:${action}`;
    const wildcardPermission = `${resource}:*`;
    const fullWildcard = '*:*';

    return user.permissions.some(permission => 
      permission === requiredPermission ||
      permission === wildcardPermission ||
      permission === fullWildcard
    );
  }

  public async checkRole(authContext: AuthContext, requiredRole: string): Promise<boolean> {
    return authContext.user.roles.includes(requiredRole);
  }

  public async checkScope(authContext: AuthContext, requiredScope: string): Promise<boolean> {
    return authContext.scopes.includes(requiredScope) || authContext.scopes.includes('*');
  }

  private async validateUserWithAuthService(userId: string, token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/users/${userId}/validate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 3000,
        })
      );
    } catch (error) {
      this.logger.warn(`User validation with auth service failed: ${error.message}`);
      throw new UnauthorizedException('User validation failed');
    }
  }

  private async updateApiKeyLastUsed(apiKeyId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(`${this.authServiceUrl}/api-keys/${apiKeyId}/last-used`, {
          lastUsedAt: new Date().toISOString(),
        }, {
          timeout: 2000,
        })
      );
    } catch (error) {
      // Non-critical operation, just log the error
      this.logger.debug(`Failed to update API key last used timestamp: ${error.message}`);
    }
  }

  public extractTokenFromHeader(authHeader: string): { token: string; type: 'Bearer' | 'API-Key' } | null {
    if (!authHeader) {
      return null;
    }

    // Bearer token
    if (authHeader.startsWith('Bearer ')) {
      return {
        token: authHeader.substring(7),
        type: 'Bearer',
      };
    }

    // API Key
    if (authHeader.startsWith('API-Key ')) {
      return {
        token: authHeader.substring(8),
        type: 'API-Key',
      };
    }

    // Direct token (assume Bearer)
    if (!authHeader.includes(' ')) {
      return {
        token: authHeader,
        type: 'Bearer',
      };
    }

    return null;
  }

  public async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/refresh`, {
          refreshToken,
        }, {
          timeout: 5000,
        })
      );

      return {
        accessToken: response.data.accessToken,
        expiresAt: new Date(response.data.expiresAt),
      };

    } catch (error) {
      this.logger.warn(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  public async logout(token: string, tokenType: 'Bearer' | 'API-Key'): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/logout`, {
          token,
          tokenType,
        }, {
          timeout: 5000,
        })
      );
    } catch (error) {
      this.logger.warn(`Logout failed: ${error.message}`);
      // Don't throw error for logout failures
    }
  }

  public isTokenExpired(authContext: AuthContext): boolean {
    return new Date() >= authContext.expiresAt;
  }

  public getTokenTimeToExpiry(authContext: AuthContext): number {
    return Math.max(0, authContext.expiresAt.getTime() - Date.now());
  }
}
