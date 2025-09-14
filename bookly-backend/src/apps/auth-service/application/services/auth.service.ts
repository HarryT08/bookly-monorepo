import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { UserRepository } from '@apps/auth-service/domain/repositories/user.repository';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { RegisterCommand } from '@apps/auth-service/application/commands/register.command';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { LoginDto, RegisterDto } from '@libs/dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
    private readonly loggingService: LoggingService,
  ) {}

  async validateUser(email: string, password: string, ipAddress?: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findByEmailWithRoles(email);
      
      if (!user) {
        this.loggingService.warn('Login attempt with non-existent email', {
          email,
          ipAddress,
        });
        return null;
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        this.loggingService.warn('Login attempt on locked account', {
          userId: user.id,
          email,
          ipAddress,
          lockedUntil: user.lockedUntil,
        });
        throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        this.loggingService.warn('Login attempt with unverified email', {
          userId: user.id,
          email,
          ipAddress,
        });
        throw new UnauthorizedException('Email address must be verified before login');
      }

      // Check if user is active
      if (!user.isActive) {
        this.loggingService.warn('Login attempt on inactive account', {
          userId: user.id,
          email,
          ipAddress,
        });
        throw new UnauthorizedException('Account is inactive');
      }

      // Validate password
      if (!user.password || !await bcrypt.compare(password, user.password)) {
        // Increment login attempts
        user.incrementLoginAttempts();
        await this.userRepository.update(user.id, {
          loginAttempts: user.loginAttempts,
          lockedUntil: user.lockedUntil,
        });

        this.loggingService.warn('Failed login attempt - invalid password', {
          userId: user.id,
          email,
          ipAddress,
          loginAttempts: user.loginAttempts,
        });
        return null;
      }

      // Reset login attempts on successful validation
      user.resetLoginAttempts();
      await this.userRepository.update(user.id, {
        loginAttempts: user.loginAttempts,
        lockedUntil: user.lockedUntil,
        lastLoginAt: user.lastLoginAt,
      });

      this.loggingService.log('Successful user validation', {
        userId: user.id,
        email,
        ipAddress,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Error during user validation', error, LoggingHelper.logParams({
        email,
        ipAddress,
      }));
      throw error;
    }
  }

  async login(user: UserEntity, ipAddress?: string): Promise<{ access_token: string; user: any }> {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.userRoles?.map(ur => ur.role?.name) || [],
        permissions: user.getAllPermissions().map(p => p.name),
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = this.jwtService.sign(payload);

      this.loggingService.log('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ipAddress,
        roles: payload.roles,
      });

      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          lastLoginAt: user.lastLoginAt,
          roles: user.userRoles?.map(ur => ur.role) || [],
          permissions: user.getAllPermissions(),
        },
      };
    } catch (error) {
      this.loggingService.error('Error during login', error, LoggingHelper.logParams({
        userId: user.id,
        email: user.email,
        ipAddress,
      }));
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.userRepository.findByIdWithRoles(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.userRoles?.map(ur => ur.role?.name) || [],
      permissions: user.getAllPermissions().map(p => p.name),
      iat: Math.floor(Date.now() / 1000),
    };

    this.loggingService.log('Token refreshed successfully', LoggingHelper.logParams({
      userId: user.id,
      email: user.email,
    }));

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Login user with credentials
   */
  async loginUser(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        this.loggingService.warn(`Failed login attempt for email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const loginResult = await this.login(user);
      return loginResult;
    } catch (error) {
      this.loggingService.error('Error during user login', error, LoggingHelper.logParams({
        email: loginDto.email,
      }));
      throw error;
    }
  }

  /**
   * Register a new user using CQRS
   */
  async register(registerDto: RegisterDto): Promise<{ message: string; user: any }> {
    try {
      // Use CQRS Command pattern
      const command = new RegisterCommand({
        ...registerDto,
        username: registerDto.username || registerDto.email.split('@')[0],
      });

      const createdUser = await this.commandBus.execute<RegisterCommand, UserEntity>(command);

      return {
        message: 'User registered successfully. Please verify your email.',
        user: {
          id: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          isEmailVerified: createdUser.isEmailVerified,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggingService.error('Error during user registration', error, LoggingHelper.logParams({
        email: registerDto.email,
      }));
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Login user via SSO (Google OAuth2)
   */
  async loginSSO(ssoUser: any): Promise<{ access_token: string; user: any }> {
    try {
      const payload = {
        sub: ssoUser.id,
        email: ssoUser.email,
        username: ssoUser.username,
        roles: ssoUser.roles || [],
        ssoProvider: ssoUser.ssoProvider || 'google',
        iat: Math.floor(Date.now() / 1000),
      };

      this.loggingService.log(
        `SSO login successful for user: ${ssoUser.email}`,
        'AuthService',
      );

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: ssoUser.id,
          email: ssoUser.email,
          username: ssoUser.username,
          firstName: ssoUser.firstName,
          lastName: ssoUser.lastName,
          roles: ssoUser.roles || [],
          ssoProvider: ssoUser.ssoProvider,
        },
      };
    } catch (error) {
      this.loggingService.error(
        'SSO login failed',
        error.stack,
        'AuthService',
      );
      throw error;
    }
  }
}
