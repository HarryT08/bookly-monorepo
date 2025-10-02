import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, AuthUser, AuthContext } from '../../infrastructure/services/auth.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

// Helper function to create mock AxiosResponse
const createMockAxiosResponse = <T>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

describe('AuthService', () => {
  let service: AuthService;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let httpService: jest.Mocked<HttpService>;

  const mockUser: AuthUser = {
    id: 'user123',
    email: 'test@example.com',
    roles: ['user', 'admin'],
    permissions: ['read:resources', 'write:resources'],
    isActive: true,
    lastLoginAt: new Date(),
  };

  const mockJwtPayload = {
    sub: 'user123',
    email: 'test@example.com',
    roles: ['user', 'admin'],
    permissions: ['read:resources', 'write:resources'],
    isActive: true,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    scopes: ['api:read', 'api:write'],
  };

  beforeEach(async () => {
    // Setup configuration mock before creating the service
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          'gateway.security.jwt.secret': 'test-secret',
          'gateway.microservices.auth.url': 'http://auth-service:3001',
        };
        return config[key];
      }),
    };

    const mockJwtService = {
      verify: jest.fn(),
    };

    const mockHttpService = {
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
    httpService = module.get(HttpService);
  });

  describe('JWT Token Validation', () => {
    it('should validate valid JWT token', async () => {
      jwtService.verify.mockReturnValue(mockJwtPayload);
      httpService.get.mockReturnValue(of(createMockAxiosResponse({ valid: true })));

      const result = await service.validateJwtToken('valid.jwt.token');

      expect(result.user.id).toBe('user123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.roles).toEqual(['user', 'admin']);
      expect(result.tokenType).toBe('Bearer');
      expect(result.scopes).toEqual(['api:read', 'api:write']);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateJwtToken('invalid.token'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const expiredPayload = {
        ...mockJwtPayload,
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      jwtService.verify.mockReturnValue(expiredPayload);

      await expect(service.validateJwtToken('expired.token'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle auth service validation failure', async () => {
      jwtService.verify.mockReturnValue(mockJwtPayload);
      httpService.get.mockReturnValue(throwError(() => new Error('Auth service unavailable')));

      await expect(service.validateJwtToken('valid.jwt.token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('API Key Validation', () => {
    const mockApiKeyInfo = {
      id: 'key123',
      name: 'Test API Key',
      userId: 'user123',
      scopes: ['api:read'],
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
    };

    it('should validate active API key', async () => {
      httpService.post.mockReturnValue(of(createMockAxiosResponse(mockApiKeyInfo)));
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockUser)));
      httpService.patch.mockReturnValue(of(createMockAxiosResponse({ success: true })));

      const result = await service.validateApiKey('valid-api-key');

      expect(result.user.id).toBe('user123');
      expect(result.tokenType).toBe('API-Key');
      expect(result.scopes).toEqual(['api:read']);
    });

    it('should throw UnauthorizedException for inactive API key', async () => {
      const inactiveKeyInfo = { ...mockApiKeyInfo, isActive: false };
      httpService.post.mockReturnValue(of(createMockAxiosResponse(inactiveKeyInfo)));

      await expect(service.validateApiKey('inactive-key'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired API key', async () => {
      const expiredKeyInfo = {
        ...mockApiKeyInfo,
        expiresAt: new Date(Date.now() - 86400000), // 24 hours ago
      };
      httpService.post.mockReturnValue(of(createMockAxiosResponse(expiredKeyInfo)));

      await expect(service.validateApiKey('expired-key'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle API key validation service error', async () => {
      httpService.post.mockReturnValue(throwError(() => new Error('Service error')));

      await expect(service.validateApiKey('error-key'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Session Validation', () => {
    const mockSessionData = {
      isActive: true,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      user: mockUser,
      scopes: ['session:read'],
    };

    it('should validate active session', async () => {
      httpService.post.mockReturnValue(of(createMockAxiosResponse(mockSessionData)));

      const result = await service.validateSession('valid-session-id');

      expect(result.user.id).toBe('user123');
      expect(result.tokenType).toBe('Bearer');
      expect(result.scopes).toEqual(['session:read']);
    });

    it('should throw UnauthorizedException for inactive session', async () => {
      const inactiveSession = { ...mockSessionData, isActive: false };
      httpService.post.mockReturnValue(of(createMockAxiosResponse(inactiveSession)));

      await expect(service.validateSession('inactive-session'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired session', async () => {
      const expiredSession = {
        ...mockSessionData,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };
      httpService.post.mockReturnValue(of(createMockAxiosResponse(expiredSession)));

      await expect(service.validateSession('expired-session'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Permission Checking', () => {
    const mockAuthContext: AuthContext = {
      user: mockUser,
      token: 'test-token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 3600000),
      scopes: ['api:read'],
    };

    it('should allow access for admin role', async () => {
      const adminUser = { ...mockUser, roles: ['admin'] };
      const adminContext = { ...mockAuthContext, user: adminUser };

      const hasPermission = await service.checkPermission(adminContext, 'resources', 'read');

      expect(hasPermission).toBe(true);
    });

    it('should allow access for specific permission', async () => {
      const hasPermission = await service.checkPermission(mockAuthContext, 'resources', 'read');

      expect(hasPermission).toBe(true);
    });

    it('should deny access for missing permission', async () => {
      const limitedUser = {
        ...mockUser,
        roles: ['user'],
        permissions: ['read:other'],
      };
      const limitedContext = { ...mockAuthContext, user: limitedUser };

      const hasPermission = await service.checkPermission(limitedContext, 'resources', 'write');

      expect(hasPermission).toBe(false);
    });

    it('should fallback to auth service for complex permissions', async () => {
      const limitedUser = {
        ...mockUser,
        roles: ['user'],
        permissions: [],
      };
      const limitedContext = { ...mockAuthContext, user: limitedUser };

      httpService.post.mockReturnValue(of(createMockAxiosResponse({ allowed: true })));

      const hasPermission = await service.checkPermission(limitedContext, 'resources', 'read');

      expect(hasPermission).toBe(true);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://auth-service:3001/permissions/check',
        {
          userId: 'user123',
          resource: 'resources',
          action: 'read',
          scope: undefined,
        },
        { timeout: 3000 }
      );
    });

    it('should handle auth service permission check failure', async () => {
      const limitedUser = {
        ...mockUser,
        roles: ['user'],
        permissions: [],
      };
      const limitedContext = { ...mockAuthContext, user: limitedUser };

      httpService.post.mockReturnValue(throwError(() => new Error('Service error')));

      const hasPermission = await service.checkPermission(limitedContext, 'resources', 'read');

      expect(hasPermission).toBe(false);
    });
  });

  describe('Role Checking', () => {
    const mockAuthContext: AuthContext = {
      user: mockUser,
      token: 'test-token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 3600000),
      scopes: ['api:read'],
    };

    it('should return true for existing role', async () => {
      const hasRole = await service.checkRole(mockAuthContext, 'admin');

      expect(hasRole).toBe(true);
    });

    it('should return false for non-existing role', async () => {
      const hasRole = await service.checkRole(mockAuthContext, 'super-admin');

      expect(hasRole).toBe(false);
    });
  });

  describe('Scope Checking', () => {
    const mockAuthContext: AuthContext = {
      user: mockUser,
      token: 'test-token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 3600000),
      scopes: ['api:read', 'api:write'],
    };

    it('should return true for existing scope', async () => {
      const hasScope = await service.checkScope(mockAuthContext, 'api:read');

      expect(hasScope).toBe(true);
    });

    it('should return false for non-existing scope', async () => {
      const hasScope = await service.checkScope(mockAuthContext, 'api:admin');

      expect(hasScope).toBe(false);
    });

    it('should return true for wildcard scope', async () => {
      const wildcardContext = {
        ...mockAuthContext,
        scopes: ['*'],
      };

      const hasScope = await service.checkScope(wildcardContext, 'any:scope');

      expect(hasScope).toBe(true);
    });
  });

  describe('Token Extraction', () => {
    it('should extract Bearer token', () => {
      const result = service.extractTokenFromHeader('Bearer abc123');

      expect(result?.token).toBe('abc123');
      expect(result?.type).toBe('Bearer');
    });

    it('should extract API Key token', () => {
      const result = service.extractTokenFromHeader('API-Key xyz789');

      expect(result?.token).toBe('xyz789');
      expect(result?.type).toBe('API-Key');
    });

    it('should extract direct token as Bearer', () => {
      const result = service.extractTokenFromHeader('directtoken123');

      expect(result?.token).toBe('directtoken123');
      expect(result?.type).toBe('Bearer');
    });

    it('should return null for invalid header', () => {
      const result = service.extractTokenFromHeader('Invalid header format');

      expect(result).toBeNull();
    });

    it('should return null for empty header', () => {
      const result = service.extractTokenFromHeader('');

      expect(result).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh valid token', async () => {
      const refreshResponse = {
        accessToken: 'new.access.token',
        expiresAt: new Date(Date.now() + 3600000),
      };

      httpService.post.mockReturnValue(of(createMockAxiosResponse(refreshResponse)));

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new.access.token');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      httpService.post.mockReturnValue(throwError(() => new Error('Invalid refresh token')));

      await expect(service.refreshToken('invalid-refresh-token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      httpService.post.mockReturnValue(of(createMockAxiosResponse({ success: true })));

      await expect(service.logout('test-token', 'Bearer'))
        .resolves.not.toThrow();

      expect(httpService.post).toHaveBeenCalledWith(
        'http://auth-service:3001/auth/logout',
        {
          token: 'test-token',
          tokenType: 'Bearer',
        },
        { timeout: 5000 }
      );
    });

    it('should handle logout service error gracefully', async () => {
      httpService.post.mockReturnValue(throwError(() => new Error('Service error')));

      // Should not throw error for logout failures
      await expect(service.logout('test-token', 'Bearer'))
        .resolves.not.toThrow();
    });
  });

  describe('Token Expiry', () => {
    it('should detect expired token', () => {
      const expiredContext: AuthContext = {
        user: mockUser,
        token: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        scopes: [],
      };

      const isExpired = service.isTokenExpired(expiredContext);

      expect(isExpired).toBe(true);
    });

    it('should detect valid token', () => {
      const validContext: AuthContext = {
        user: mockUser,
        token: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        scopes: [],
      };

      const isExpired = service.isTokenExpired(validContext);

      expect(isExpired).toBe(false);
    });

    it('should calculate time to expiry', () => {
      const validContext: AuthContext = {
        user: mockUser,
        token: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        scopes: [],
      };

      const timeToExpiry = service.getTokenTimeToExpiry(validContext);

      expect(timeToExpiry).toBeGreaterThan(3590000); // Close to 1 hour
      expect(timeToExpiry).toBeLessThanOrEqual(3600000);
    });

    it('should return 0 for expired token time to expiry', () => {
      const expiredContext: AuthContext = {
        user: mockUser,
        token: 'test-token',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        scopes: [],
      };

      const timeToExpiry = service.getTokenTimeToExpiry(expiredContext);

      expect(timeToExpiry).toBe(0);
    });
  });
});
