import { Body, Controller, HttpException, HttpStatus, Post, Inject } from '@nestjs/common';
import { AuthResponseDto, CreateUserDto, LoginDto, RefreshTokenDto, UserResponseDto } from '@bookly-monorepo/dto';
import { LoginUserCommand } from '../../application/commands/login-user.command';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { CommandBus } from '../../app/buses/cqrs-bus';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('CommandBus') private readonly commandBus: CommandBus
  ) {}

  /**
   * Endpoint para el registro de usuarios
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const command = new RegisterUserCommand(createUserDto);
      return await this.commandBus.execute(command);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al registrar usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Endpoint para el inicio de sesión
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const command = new LoginUserCommand(loginDto);
      return await this.commandBus.execute(command);
    } catch (error) {
      throw new HttpException(
        error.message || 'Credenciales inválidas',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Endpoint para refrescar el token de acceso
   */
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      // Este sería otro comando que implementaríamos después
      const command = { type: 'auth.refreshToken', token: refreshTokenDto.refreshToken };
      return await this.commandBus.execute(command);
    } catch (error) {
      throw new HttpException(
        error.message || 'Token inválido o expirado',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Endpoint para cerrar sesión
   */
  @Post('logout')
  async logout(@Body() { refreshToken }: RefreshTokenDto): Promise<{ success: boolean }> {
    try {
      // Este sería otro comando que implementaríamos después
      const command = { type: 'auth.logoutUser', token: refreshToken };
      await this.commandBus.execute(command);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al cerrar sesión',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
