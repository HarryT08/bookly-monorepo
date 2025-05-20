import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { I18nContext } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly logger: Logger) {}

  async register(createUserDto: CreateUserDto, i18n: I18nContext) {
    // Simulación registro
    this.logger.info('User registered', { email: createUserDto.email });
    return {
      message: await i18n.t('auth.REGISTER_SUCCESS'),
    };
  }

  async login(loginDto: LoginDto, i18n: I18nContext) {
    // Simulación autenticación
    const isValid = loginDto.email === 'test@example.com' && loginDto.password === 'password123';
    if (!isValid) {
      this.logger.warn(`Login failed for email: ${loginDto.email}`);
      throw new UnauthorizedException(await i18n.t('auth.LOGIN_FAILED'));
    }
    this.logger.info('User logged in', { email: loginDto.email });
    return {
      message: await i18n.t('auth.LOGIN_SUCCESS'),
      token: 'jwt-token-simulado',
    };
  }

  async logout(user: Partial<User>, i18n: I18nContext) {
    // Simulación logout
    this.logger.info('User logged out', { userId: user?.id });
    return {
      message: await i18n.t('auth.LOGOUT_SUCCESS'),
    };
  }

  async sendPasswordReset(email: string, i18n: I18nContext) {
    // Simulación envío de correo de recuperación
    if (email !== 'test@example.com') {
      this.logger.warn(`Password reset requested for non-existent user: ${email}`);
      throw new NotFoundException(await i18n.t('auth.LOGIN_FAILED'));
    }
    this.logger.info('Password reset email sent', { email });
    return {
      message: await i18n.t('auth.PASSWORD_RESET_SENT'),
    };
  }

  async resetPassword(token: string, newPassword: string, i18n: I18nContext) {
    // Simulación de reseteo de contraseña
    if (token !== 'valid-token') {
      this.logger.warn(`Invalid password reset token: ${token}`);
      throw new UnauthorizedException(await i18n.t('auth.LOGIN_FAILED'));
    }
    this.logger.info('Password reset successful', { token });
    return {
      message: await i18n.t('auth.PASSWORD_RESET_SUCCESS'),
    };
  }
}
