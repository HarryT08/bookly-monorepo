import { ApiProperty } from '@nestjs/swagger';

/**
 * User Data DTO for responses
 */
export class UserDataDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Email verification status' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'User roles', type: 'array', required: false })
  roles?: any[];

  @ApiProperty({ description: 'User permissions', type: 'array', required: false })
  permissions?: any[];

  @ApiProperty({ description: 'SSO provider', required: false })
  ssoProvider?: string;
}

/**
 * Login Response DTO
 */
export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'User data', type: UserDataDto })
  user: UserDataDto;

  @ApiProperty({ description: 'Token expiration time', required: false })
  expires_in?: number;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  token_type: string;
}

/**
 * Register Response DTO
 */
export class RegisterResponseDto {
  @ApiProperty({ description: 'Registration success message' })
  message: string;

  @ApiProperty({ description: 'Created user data', type: UserDataDto })
  user: UserDataDto;

  @ApiProperty({ description: 'Email verification required flag' })
  emailVerificationRequired: boolean;
}

/**
 * Token Validation Response DTO
 */
export class ValidateTokenResponseDto {
  @ApiProperty({ description: 'Token validity status' })
  isValid: boolean;

  @ApiProperty({ description: 'Decoded token payload', required: false })
  payload?: any;

  @ApiProperty({ description: 'Token expiration timestamp', required: false })
  expiresAt?: number;
}

/**
 * Refresh Token Response DTO
 */
export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'Token expiration time', required: false })
  expires_in?: number;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  token_type: string;
}

/**
 * SSO Login Response DTO
 */
export class SSOLoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'User data', type: UserDataDto })
  user: UserDataDto;

  @ApiProperty({ description: 'SSO provider used' })
  ssoProvider: string;

  @ApiProperty({ description: 'Is new user (first time login)' })
  isNewUser: boolean;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  token_type: string;
}

/**
 * User Profile Response DTO
 */
export class UserProfileResponseDto {
  @ApiProperty({ description: 'User data', type: UserDataDto })
  user: UserDataDto;

  @ApiProperty({ description: 'User statistics', required: false })
  statistics?: {
    totalReservations?: number;
    totalApprovals?: number;
    lastActivity?: Date;
  };
}

/**
 * Auth Status Response DTO
 */
export class AuthStatusResponseDto {
  @ApiProperty({ description: 'Authentication status' })
  isAuthenticated: boolean;

  @ApiProperty({ description: 'User data if authenticated', type: UserDataDto, required: false })
  user?: UserDataDto;

  @ApiProperty({ description: 'Session expiration', required: false })
  sessionExpiresAt?: Date;
}
