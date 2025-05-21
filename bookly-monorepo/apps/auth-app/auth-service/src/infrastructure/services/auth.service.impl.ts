import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { IUser, LoginDto, RegisterDto } from '@bookly-monorepo/dto';
import { AuthService as DomainAuthService } from '../../domain/services/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceImpl implements DomainAuthService {
  private readonly logger = new Logger(AuthServiceImpl.name);

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

  /**
   * Implementación de los métodos requeridos por la interfaz de dominio
   */

  async validateCredentials(email: string, password: string): Promise<IUser | null> {
    // En una implementación real, buscaríamos el usuario en la base de datos
    if (email === 'test@example.com' && password === 'password123') {
      return {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: await this.hashPassword('password123'),
        role: 'user',
      };
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('auth.saltRounds') || 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(user: IUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiration'),
    });
  }

  generateRefreshToken(user: IUser): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
    });
  }

  validateAccessToken(token: string): Record<string, unknown> | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });
    } catch {
      // Si el token es inválido, devolver null
      this.logger.warn('Invalid access token');
      return null;
    }
  }

  validateRefreshToken(token: string): Record<string, unknown> | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      // Si el token es inválido, devolver null
      this.logger.warn('Invalid refresh token');
      return null;
    }
  }
}
