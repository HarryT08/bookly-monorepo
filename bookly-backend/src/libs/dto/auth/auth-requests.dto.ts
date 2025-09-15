import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Login Request DTO
 * Used for traditional email/password authentication
 */
export class LoginRequestDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'usuario@ufps.edu.co'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Client IP address for security logging',
    required: false
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

/**
 * Register Request DTO
 * Used for user registration
 */
export class RegisterRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'nuevo.usuario@ufps.edu.co'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Juan'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Pérez'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Username (optional, defaults to email prefix)',
    required: false,
    example: 'juan.perez'
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'User program/department',
    required: false,
    example: 'Ingeniería de Sistemas'
  })
  @IsOptional()
  @IsString()
  program?: string;
}

/**
 * Validate Token Request DTO
 */
export class ValidateTokenRequestDto {
  @ApiProperty({
    description: 'JWT token to validate'
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

/**
 * Refresh Token Request DTO
 */
export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'User ID for token refresh'
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

/**
 * SSO Login Request DTO
 */
export class SSOLoginRequestDto {
  @ApiProperty({
    description: 'User email from SSO provider'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User ID from SSO provider'
  })
  @IsString()
  googleId: string;

  @ApiProperty({
    description: 'User first name from SSO provider'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name from SSO provider'
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'SSO provider name',
    example: 'google'
  })
  @IsString()
  ssoProvider: string;

  @ApiProperty({
    description: 'User picture URL from SSO provider',
    required: false
  })
  @IsOptional()
  @IsString()
  picture?: string;
}

/**
 * Password Reset Request DTO
 */
export class PasswordResetRequestDto {
  @ApiProperty({
    description: 'User email address to send reset link',
    example: 'usuario@ufps.edu.co'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Client IP address for security logging',
    required: false
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

/**
 * Password Reset Confirm DTO
 */
export class PasswordResetConfirmDto {
  @ApiProperty({
    description: 'Password reset token received via email'
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}

/**
 * Password Change DTO
 */
export class PasswordChangeDto {
  @ApiProperty({
    description: 'Current password'
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePassword123!'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
