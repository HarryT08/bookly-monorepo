import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { UserRepository } from '@apps/auth-service/domain/repositories/user.repository';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { RegisterCommand } from '@apps/auth-service/application/commands/register.command';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { AuthValidationUtil } from '@apps/auth-service/application/utils/auth-validation.util';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ValidateTokenRequestDto,
  RefreshTokenRequestDto,
  SSOLoginRequestDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
  PasswordChangeDto
} from '@libs/dto/auth/auth-requests.dto';
import {
  LoginResponseDto,
  RegisterResponseDto,
  ValidateTokenResponseDto,
  RefreshTokenResponseDto,
  SSOLoginResponseDto
} from '@libs/dto/auth/auth-responses.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Public method: Validate user credentials for LocalStrategy
   */
  async validateUser(email: string, password: string, ipAddress?: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findByEmailWithRoles(email);
      
      if (!user) {
        this.loggingService.warn('Login attempt with non-existent email', 
          AuthValidationUtil.createAuthErrorContext('validateUser', email, ipAddress)
        );
        return null;
      }

      // Apply business validation rules
      AuthValidationUtil.validateAccountNotLocked(user);
      AuthValidationUtil.validateEmailVerified(user);
      AuthValidationUtil.validateAccountActive(user);

      // Validate password using utility
      const isPasswordValid = await AuthValidationUtil.validatePassword(user, password, bcrypt);
      if (!isPasswordValid) {
        await AuthValidationUtil.handleFailedLoginAttempt(user, this.userRepository);
        this.loggingService.warn('Failed login attempt - invalid password', 
          AuthValidationUtil.createAuthErrorContext('validateUser', email, ipAddress, {
            userId: user.id,
            loginAttempts: user.loginAttempts
          })
        );
        return null;
      }

      // Handle successful login
      await AuthValidationUtil.handleSuccessfulLogin(user, this.userRepository);
      this.loggingService.log('Successful user validation', 
        AuthValidationUtil.createAuthErrorContext('validateUser', email, ipAddress, {
          userId: user.id
        })
      );

      return user;
    } catch (error) {
      this.loggingService.error('Error during user validation', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Public method: Generate JWT token and user data
   */
  async login(user: UserEntity, ipAddress?: string): Promise<{ access_token: string; user: any }> {
    try {
      const payload = AuthValidationUtil.createJwtPayload(user);
      const accessToken = this.jwtService.sign(payload);
      const userData = AuthValidationUtil.createUserDataResponse(user);

      this.loggingService.log('User logged in successfully', 
        AuthValidationUtil.createAuthErrorContext('login', user.email, ipAddress, {
          userId: user.id,
          roles: payload.roles
        })
      );

      return {
        access_token: accessToken,
        user: userData,
      };
    } catch (error) {
      this.loggingService.error('Error during login', error, 'AuthService');
      throw error;
    }
  }

  /**
   * RF-43: Validate JWT token using DTO
   */
  async validateToken(request: ValidateTokenRequestDto): Promise<ValidateTokenResponseDto> {
    try {
      const payload = this.jwtService.verify(request.token);
      return {
        isValid: true,
        payload,
        expiresAt: payload.exp
      };
    } catch (error) {
      this.loggingService.warn('Token validation failed', 
        AuthValidationUtil.createAuthErrorContext('validateToken', 'unknown')
      );
      return {
        isValid: false
      };
    }
  }

  /**
   * RF-43: Refresh JWT token using DTO
   */
  async refreshToken(request: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    const user = await this.userRepository.findByIdWithRoles(request.userId);
    AuthValidationUtil.validateUserExists(user, 'refresh-token');

    const payload = AuthValidationUtil.createJwtPayload(user);
    const accessToken = this.jwtService.sign(payload);

    this.loggingService.log('Token refreshed successfully', 
      AuthValidationUtil.createAuthErrorContext('refreshToken', user.email, undefined, {
        userId: user.id
      })
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  /**
   * Login user with credentials
   */
  /**
   * RF-43: Login user with credentials using DTO
   */
  async loginUser(request: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const user = await this.validateUser(request.email, request.password, request.ipAddress);
      if (!user) {
        this.loggingService.warn(`Failed login attempt for email: ${request.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const loginResult = await this.login(user, request.ipAddress);
      return {
        access_token: loginResult.access_token,
        user: loginResult.user,
        token_type: 'Bearer',
        expires_in: 3600 // 1 hour
      };
    } catch (error) {
      this.loggingService.error('Error during user login', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Register a new user using CQRS
   */
  /**
   * RF-43: Register new user using CQRS and DTO
   */
  async register(request: RegisterRequestDto): Promise<RegisterResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(request.password, 10);

      // Create user entity with correct constructor parameters
      const newUser = new UserEntity(
        '', // ID will be generated by repository
        request.email,
        request.username || request.email.split('@')[0],
        hashedPassword,
        request.firstName,
        request.lastName,
        true, // isActive
        false, // isEmailVerified
        undefined, // emailVerificationToken
        undefined, // passwordResetToken
        undefined, // passwordResetExpires
        undefined, // lastLoginAt
        0, // loginAttempts
        undefined, // lockedUntil
        undefined, // ssoProvider
        undefined, // ssoId
        new Date(), // createdAt
        new Date(), // updatedAt
        [] // userRoles
      );
      const createdUser = await this.userRepository.create(newUser);

      // Log successful registration
      this.loggingService.log(
        `New user registered successfully: ${createdUser.email}`,
        'AuthService.register'
      );

      const userResponse = AuthValidationUtil.createUserDataResponse(createdUser);

      return {
        message: 'User registered successfully. Please verify your email.',
        user: userResponse,
        emailVerificationRequired: true
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggingService.error('Error during user registration', error, 'AuthService');
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Login user via SSO (Google OAuth2)
   */
  /**
   * RF-43: SSO Login using DTO (Google OAuth2)
   */
  async loginSSO(request: SSOLoginRequestDto): Promise<SSOLoginResponseDto> {
    try {
      const payload = {
        sub: request.googleId,
        email: request.email,
        username: request.email.split('@')[0],
        roles: AuthValidationUtil.isValidUFPSDomain(request.email) 
          ? [AuthValidationUtil.getDefaultRoleFromEmail(request.email)] 
          : [],
        ssoProvider: request.ssoProvider,
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = this.jwtService.sign(payload);
      const userData = AuthValidationUtil.createSSOUserDataResponse({
        id: request.googleId,
        email: request.email,
        username: request.email.split('@')[0],
        firstName: request.firstName,
        lastName: request.lastName,
        roles: payload.roles,
        ssoProvider: request.ssoProvider
      });

      this.loggingService.log(
        `SSO login successful for user: ${request.email}`,
        AuthValidationUtil.createAuthErrorContext('loginSSO', request.email)
      );

      return {
        access_token: accessToken,
        user: userData,
        ssoProvider: request.ssoProvider,
        isNewUser: false,
        token_type: 'Bearer'
      };
    } catch (error) {
      this.loggingService.error('SSO login failed', error, 'AuthService');
      throw error;
    }
  }

  /**
   * Request password reset - sends reset token to user's email
   */
  async requestPasswordReset(request: PasswordResetRequestDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findByEmail(request.email);
      
      // Always return success message for security (don't reveal if email exists)
      if (!user) {
        this.loggingService.warn('Password reset requested for non-existent email', {
          email: request.email,
          ipAddress: request.ipAddress
        });
        return { message: 'Si el email existe, se ha enviado un enlace de recuperación.' };
      }

      // Generate reset token (in real implementation, this would be a cryptographically secure token)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Update user with reset token
      await this.userRepository.update(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      // TODO: Send email with reset link (implement email service)
      this.loggingService.log('Password reset token generated', {
        userId: user.id,
        email: user.email,
        ipAddress: request.ipAddress
      });

      return { message: 'Si el email existe, se ha enviado un enlace de recuperación.' };
    } catch (error) {
      this.loggingService.error('Error during password reset request', error, 'AuthService');
      throw new BadRequestException('Error processing password reset request');
    }
  }

  /**
   * Confirm password reset using token
   */
  async confirmPasswordReset(request: PasswordResetConfirmDto): Promise<{ message: string }> {
    try {
      // Validate passwords match
      if (request.newPassword !== request.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      // Find user by reset token
      const user = await this.userRepository.findByPasswordResetToken(request.token);
      if (!user) {
        throw new BadRequestException('Token de recuperación inválido o expirado');
      }

      // Check if token is expired
      if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        throw new BadRequestException('Token de recuperación expirado');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(request.newPassword, 10);

      // Update user password and clear reset token
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        loginAttempts: 0,
        lockedUntil: undefined
      });

      this.loggingService.log('Password reset completed successfully', {
        userId: user.id,
        email: user.email
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggingService.error('Error during password reset confirmation', error, 'AuthService');
      throw new BadRequestException('Error al confirmar el cambio de contraseña');
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, request: PasswordChangeDto): Promise<{ message: string }> {
    try {
      // Validate passwords match
      if (request.newPassword !== request.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      // Find user
      const user = await this.userRepository.findByIdWithRoles(userId);
      AuthValidationUtil.validateUserExists(user, 'change-password');

      // Validate current password
      const isCurrentPasswordValid = await bcrypt.compare(request.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Contraseña actual incorrecta');
      }

      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(request.newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(request.newPassword, 10);

      // Update user password
      await this.userRepository.update(user.id, {
        password: hashedPassword
      });

      this.loggingService.log('Password changed successfully', {
        userId: user.id,
        email: user.email
      });

      return { message: 'Contraseña cambiada exitosamente' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggingService.error('Error during password change', error, 'AuthService');
      throw new BadRequestException('Error al cambiar la contraseña');
    }
  }
}
