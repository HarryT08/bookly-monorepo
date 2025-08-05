import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../application/services/user.service';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/oauth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth2 configuration is missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      const email = emails[0]?.value;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user already exists
      let user = await this.userService.findByEmail(email);

      if (!user) {
        // Create new user with SSO data
        const userData = {
          email,
          username: email.split('@')[0], // Use email prefix as username
          firstName: name.givenName || '',
          lastName: name.familyName || '',
          password: undefined, // No password for SSO users
          ssoProvider: 'google',
          ssoId: id,
          isEmailVerified: true, // Google emails are pre-verified
        };

        user = await this.userService.createSSOUser(userData);
      } else {
        // Update existing user with SSO info if not already set
        if (!user.ssoProvider || !user.ssoId) {
          await this.userService.updateSSOInfo(user.id, 'google', id);
          user.ssoProvider = 'google';
          user.ssoId = id;
        }

        // Update last login
        await this.userService.updateLastLogin(user.id);
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ssoProvider: user.ssoProvider,
        roles: await this.userService.getUserRoles(user.id),
      };

      return done(null, userPayload);
    } catch (error) {
      return done(error, null);
    }
  }
}
