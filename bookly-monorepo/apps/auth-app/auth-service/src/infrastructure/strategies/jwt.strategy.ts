import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') ?? 'bookly-access-secret',
    });
  }

  async validate(payload: JwtPayload) {
    try {
      if (!payload) {
        throw new UnauthorizedException(await this.i18n.translate('AUTH.TOKEN_INVALID'));
      }
      return { 
        userId: payload.sub, 
        email: payload.email, 
        roles: payload.role ? [payload.role] : [] // Ajustamos para manejar 'role' como un string
      };
    } catch (error) {
      console.error('Error validating JWT payload:', error);
      throw new UnauthorizedException(await this.i18n.translate('AUTH.TOKEN_INVALID'));
    }
  }
}
