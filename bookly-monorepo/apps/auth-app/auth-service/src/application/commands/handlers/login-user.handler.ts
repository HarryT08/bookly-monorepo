import { CommandHandler, ICommandHandler } from '@bookly-monorepo/common';
import { AuthResponseDto } from '@bookly-monorepo/dto';
import { EventPublisher } from '@bookly-monorepo/event-bus';
import { Inject } from '@nestjs/common';
import { AuthService } from '../../../domain/services/auth.service';
import { LoginUserCommand } from '../impl/login-user.command';
import { UserServiceProxy } from '../../../infrastructure/proxies/user-service.proxy';

/**
 * Manejador para el comando de inicio de sesiu00f3n
 */
@CommandHandler('auth.loginUser')
export class LoginUserHandler implements ICommandHandler<LoginUserCommand, AuthResponseDto> {
  constructor(
    private readonly userServiceProxy: UserServiceProxy,
    @Inject('AuthService') private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthResponseDto> {
    const { credentials } = command;

    // Validar credenciales del usuario
    const user = await this.authService.validateCredentials(
      credentials.email,
      credentials.password,
    );

    if (!user) {
      throw new Error('Credenciales invu00e1lidas');
    }

    if (!user.isActive) {
      throw new Error('Usuario desactivado');
    }

    // Actualizar fecha de u00faltimo inicio de sesiu00f3n
    const lastLoginDate = new Date();
    await this.userServiceProxy.updateUser(user.id, { lastLoginAt: lastLoginDate });

    // Generar tokens de acceso y refresco
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Guardar el token de refresco en la base de datos
    await this.userServiceProxy.updateRefreshToken(user.id, refreshToken);

    // Publicar evento de inicio de sesiu00f3n
    await this.eventPublisher.publish(
      'user.loggedIn',
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date(),
      },
    );

    // Devolver respuesta con tokens
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hora en segundos
      tokenType: 'Bearer',
    };
  }
}
