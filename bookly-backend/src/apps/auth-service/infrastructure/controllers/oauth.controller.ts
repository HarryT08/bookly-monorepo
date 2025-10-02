import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { AuthService } from '../../application/services/auth.service';
import { SSOConfigGuard } from '../guards/sso-config.guard';
import { AUTH_URLS } from '../../utils/maps/urls.map';

@ApiTags('OAuth2')
@Controller(AUTH_URLS.OAUTH)
@UseGuards(SSOConfigGuard)
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get(AUTH_URLS.OAUTH_GOOGLE)
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 authentication' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth2 consent screen' })
  async googleAuth(@Req() req: Request) {
    // Guard redirects to Google OAuth2 consent screen
  }

  @Get(AUTH_URLS.OAUTH_GOOGLE_CALLBACK)
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with authentication result' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      
      if (!user) {
        return this.redirectWithError(res, 'Authentication failed');
      }

      // Generate JWT token for the authenticated user
      const loginResult = await this.authService.loginSSO(user);
      
      // Redirect to frontend with success
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return this.redirectWithError(res, 'Authentication processing failed');
    }
  }

  @Get(AUTH_URLS.OAUTH_GOOGLE_LOGOUT)
  @ApiOperation({ summary: 'Logout from Google OAuth2' })
  @ApiResponse({ status: 302, description: 'Redirects to Google logout and then to frontend' })
  async googleLogout(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const googleLogoutUrl = `https://accounts.google.com/logout?continue=${encodeURIComponent(frontendUrl)}`;
    
    return res.redirect(googleLogoutUrl);
  }

  private redirectWithError(res: Response, error: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}`;
    
    return res.redirect(redirectUrl);
  }
}
