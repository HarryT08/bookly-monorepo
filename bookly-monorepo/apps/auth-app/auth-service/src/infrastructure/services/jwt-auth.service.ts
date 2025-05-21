import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../domain/entities/user.entity';
import { AuthService } from '../../domain/services/auth.service';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../domain/repositories/user.repository';

// Importar constantes
import { JWT_CONSTANTS } from '../constants/jwt.constants';

@Injectable()
export class JwtAuthService implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(user: User): string {
    const payload = {
      [JWT_CONSTANTS.PAYLOAD_SUBJECT]: user.id,
      [JWT_CONSTANTS.PAYLOAD_EMAIL]: user.email,
      [JWT_CONSTANTS.PAYLOAD_ROLE]: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(JWT_CONSTANTS.ACCESS_SECRET_ENV),
      expiresIn: this.configService.get<string>(JWT_CONSTANTS.ACCESS_EXPIRATION_ENV) || JWT_CONSTANTS.DEFAULT_ACCESS_EXPIRATION,
    });
  }

  generateRefreshToken(user: User): string {
    const payload = {
      [JWT_CONSTANTS.PAYLOAD_SUBJECT]: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(JWT_CONSTANTS.REFRESH_SECRET_ENV),
      expiresIn: this.configService.get<string>(JWT_CONSTANTS.REFRESH_EXPIRATION_ENV) || JWT_CONSTANTS.DEFAULT_REFRESH_EXPIRATION,
    });
  }

  validateAccessToken(token: string): Record<string, any> | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(JWT_CONSTANTS.ACCESS_SECRET_ENV),
      });
    } catch (_) {
      // Cualquier error en la verificación del token retorna null
      return null;
    }
  }

  validateRefreshToken(token: string): Record<string, any> | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(JWT_CONSTANTS.REFRESH_SECRET_ENV),
      });
    } catch (_) {
      // Cualquier error en la verificación del token retorna null
      return null;
    }
  }
}
