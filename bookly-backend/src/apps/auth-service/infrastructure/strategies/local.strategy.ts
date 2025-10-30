import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../application/services/auth.service';
import { LoginRequestDto } from '@libs/dto/auth/auth-requests.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const loginRequest: LoginRequestDto = { email, password };
      const loginResult = await this.authService.loginUser(loginRequest);
      return loginResult.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
