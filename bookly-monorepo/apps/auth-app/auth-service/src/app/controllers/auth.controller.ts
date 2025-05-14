import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly logger: Logger) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @I18n() i18n: I18nContext) {
    this.logger.info('User registration attempt', { email: createUserDto.email });
    return this.authService.register(createUserDto, i18n);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @I18n() i18n: I18nContext) {
    this.logger.info('User login attempt', { email: loginDto.email });
    return this.authService.login(loginDto, i18n);
  }

  @Post('logout')
  async logout(@Req() req, @I18n() i18n: I18nContext) {
    this.logger.info('User logout attempt', { userId: req.user?.id });
    return this.authService.logout(req.user, i18n);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @I18n() i18n: I18nContext) {
    this.logger.info('Password reset requested', { email });
    return this.authService.sendPasswordReset(email, i18n);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string, @I18n() i18n: I18nContext) {
    this.logger.info('Password reset attempt', { token });
    return this.authService.resetPassword(token, password, i18n);
  }
}
