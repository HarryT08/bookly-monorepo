import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { LoginDto, RegisterDto } from '@libs/dto';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { LoginCommand } from '../../application/commands/login.command';
import { RegisterCommand } from '../../application/commands/register.command';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AUTH_URLS } from '../../utils/maps/urls.map';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post(AUTH_URLS.AUTH_LOGIN)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.commandBus.execute(
      new LoginCommand(loginDto),
    );
    return ResponseUtil.success(result, 'Login successful');
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @Post(AUTH_URLS.AUTH_REGISTER)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.commandBus.execute(
      new RegisterCommand(registerDto),
    );
    return ResponseUtil.success(result, 'User registered successfully');
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved',
    type: SuccessResponseDto
  })
  @UseGuards(JwtAuthGuard)
  @Post(AUTH_URLS.AUTH_USER_PROFILE)
  async getProfile(@Request() req) {
    return ResponseUtil.success(req.user, 'User profile retrieved');
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    type: SuccessResponseDto
  })
  @UseGuards(JwtAuthGuard)
  @Post(AUTH_URLS.AUTH_LOGOUT)
  async logout() {
    // In a real implementation, you might want to blacklist the token
    return ResponseUtil.success(null, 'Logout successful');
  }
}
