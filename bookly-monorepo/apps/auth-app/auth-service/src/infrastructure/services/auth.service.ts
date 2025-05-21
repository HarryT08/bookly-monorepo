import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { IUser, LoginDto, RegisterDto } from '@bookly-monorepo/dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService
  ) {}

  async register(createUserDto: RegisterDto) {
    try {
      this.logger.info('Processing registration request', { email: createUserDto.email });
      
      // Publicar un evento para que el servicio de usuarios cree el usuario
      const requestId = Math.random().toString(36).substring(2, 15);
      this.eventBus.publish({
        eventName: 'auth.registerUser',
        version: '1.0',
        timestamp: new Date(),
        correlationId: `auth-register-${requestId}`,
        payload: { userData: createUserDto, requestId }
      });
      
      // En una implementación real, esperaríamos la respuesta del servicio de usuarios
      // Aquí simularemos un éxito por ahora
      return {
        message: this.i18n.translate('AUTH.REGISTER_SUCCESS'),
      };
    } catch (error) {
      this.logger.error('Registration failed', { error, email: createUserDto.email });
      throw new UnauthorizedException(this.i18n.translate('AUTH.REGISTER_FAILED'));
    }
  }

  async login(loginDto: LoginDto) {
    // Implementation to be moved to command handlers
    const isValid = loginDto.email === 'test@example.com' && loginDto.password === 'password123';
    if (!isValid) {
      this.logger.warn(`Login failed for email: ${loginDto.email}`);
      throw new UnauthorizedException(this.i18n.translate('AUTH.LOGIN_FAILED'));
    }
    this.logger.info('User logged in', { email: loginDto.email });
    return {
      message: this.i18n.translate('AUTH.LOGIN_SUCCESS'),
      token: 'jwt-token-simulado',
    };
  }

  async logout(user: Partial<IUser>) {
    // Implementation to be moved to command handlers
    this.logger.info('User logged out', { userId: user?.id });
    return {
      message: this.i18n.translate('AUTH.LOGOUT_SUCCESS'),
    };
  }

  async sendPasswordReset(email: string) {
    // Implementation to be moved to command handlers
    if (email !== 'test@example.com') {
      this.logger.warn(`Password reset requested for non-existent user: ${email}`);
      throw new NotFoundException(this.i18n.translate('AUTH.LOGIN_FAILED'));
    }
    this.logger.info('Password reset email sent', { email });
    return {
      message: this.i18n.translate('AUTH.PASSWORD_RESET_REQUEST'),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Implementation to be moved to command handlers
    if (token !== 'valid-token') {
      this.logger.warn(`Invalid password reset token: ${token}`);
      throw new UnauthorizedException(this.i18n.translate('AUTH.LOGIN_FAILED'));
    }
    // Aquí se implementaría la actualización de la contraseña usando newPassword
    this.logger.info('Password reset successful', { token, passwordLength: newPassword.length });
    return {
      message: this.i18n.translate('AUTH.PASSWORD_RESET_SUCCESS'),
    };
  }
}
