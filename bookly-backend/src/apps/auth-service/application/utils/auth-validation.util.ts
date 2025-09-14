import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';

/**
 * Auth Validation Utility
 * Centralizes common authentication validation logic
 * Eliminates code duplication and provides consistent error handling
 */
export class AuthValidationUtil {
  
  /**
   * Validates that user exists
   * @param user User entity to validate
   * @param email Email for error context
   * @throws UnauthorizedException if user not found
   */
  static validateUserExists(user: UserEntity | null, email: string): UserEntity {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /**
   * Validates that user account is not locked
   * @param user User entity to validate
   * @throws UnauthorizedException if account is locked
   */
  static validateAccountNotLocked(user: UserEntity): void {
    if (user.isAccountLocked()) {
      throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts');
    }
  }

  /**
   * Validates that user email is verified
   * @param user User entity to validate
   * @throws UnauthorizedException if email not verified
   */
  static validateEmailVerified(user: UserEntity): void {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email address must be verified before login');
    }
  }

  /**
   * Validates that user account is active
   * @param user User entity to validate
   * @throws UnauthorizedException if account inactive
   */
  static validateAccountActive(user: UserEntity): void {
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }
  }

  /**
   * Validates user password
   * @param user User entity
   * @param plainPassword Plain text password to validate
   * @param bcrypt Bcrypt instance for comparison
   * @returns Promise<boolean> - true if password is valid
   */
  static async validatePassword(
    user: UserEntity, 
    plainPassword: string, 
    bcrypt: any
  ): Promise<boolean> {
    if (!user.password) {
      return false;
    }
    return await bcrypt.compare(plainPassword, user.password);
  }

  /**
   * Handles failed login attempt
   * @param user User entity
   * @param userRepository Repository to update user
   * @returns Promise<void>
   */
  static async handleFailedLoginAttempt(
    user: UserEntity,
    userRepository: any
  ): Promise<void> {
    user.incrementLoginAttempts();
    await userRepository.update(user.id, {
      loginAttempts: user.loginAttempts,
      lockedUntil: user.lockedUntil,
    });
  }

  /**
   * Handles successful login
   * @param user User entity
   * @param userRepository Repository to update user
   * @returns Promise<void>
   */
  static async handleSuccessfulLogin(
    user: UserEntity,
    userRepository: any
  ): Promise<void> {
    user.resetLoginAttempts();
    await userRepository.update(user.id, {
      loginAttempts: user.loginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
    });
  }

  /**
   * Creates JWT payload for user
   * @param user User entity
   * @returns JWT payload object
   */
  static createJwtPayload(user: UserEntity): any {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.userRoles?.map(ur => ur.role?.name) || [],
      permissions: user.getAllPermissions().map(p => p.name),
      iat: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Creates user data response object
   * @param user User entity
   * @returns User data for API responses
   */
  static createUserDataResponse(user: UserEntity): any {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      roles: user.userRoles?.map(ur => ur.role) || [],
      permissions: user.getAllPermissions(),
    };
  }

  /**
   * Creates SSO user data response object
   * @param ssoUser SSO user object
   * @returns User data for SSO responses
   */
  static createSSOUserDataResponse(ssoUser: any): any {
    return {
      id: ssoUser.id,
      email: ssoUser.email,
      username: ssoUser.username,
      firstName: ssoUser.firstName,
      lastName: ssoUser.lastName,
      roles: ssoUser.roles || [],
      ssoProvider: ssoUser.ssoProvider,
    };
  }

  /**
   * Validates email domain for UFPS users
   * @param email Email to validate
   * @returns boolean - true if valid UFPS domain
   */
  static isValidUFPSDomain(email: string): boolean {
    const validDomains = ['@ufps.edu.co', '@cloud.ufps.edu.co'];
    return validDomains.some(domain => email.endsWith(domain));
  }

  /**
   * Determines default role based on email domain
   * @param email User email
   * @returns string - role name
   */
  static getDefaultRoleFromEmail(email: string): string {
    if (email.includes('estudiante') || email.includes('student')) {
      return 'ESTUDIANTE';
    }
    if (email.includes('docente') || email.includes('profesor')) {
      return 'DOCENTE';
    }
    if (email.includes('admin')) {
      return 'ADMINISTRADOR_GENERAL';
    }
    return 'ESTUDIANTE'; // Default role
  }

  /**
   * Creates error context for logging
   * @param operation Operation being performed
   * @param email User email
   * @param ipAddress IP address
   * @param additionalContext Additional context
   * @returns Structured error context
   */
  static createAuthErrorContext(
    operation: string,
    email: string,
    ipAddress?: string,
    additionalContext: Record<string, any> = {}
  ): Record<string, any> {
    return {
      operation,
      email,
      ipAddress,
      timestamp: new Date().toISOString(),
      ...additionalContext
    };
  }
}
