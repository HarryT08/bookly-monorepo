import { CommandHandler, ICommand, ICommandHandler } from '@bookly-monorepo/common';
import { AuthResponseDto, LoginDto } from '@bookly-monorepo/dto';
import { EventPublisher } from '@bookly-monorepo/event-bus';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthService } from '../../domain/services/auth.service';
import { Inject } from '@nestjs/common';

/**
 * Comando para iniciar sesiu00f3n de un usuario
 */
export class LoginUserCommand implements ICommand {
  readonly type = 'auth.loginUser';
  
  constructor(
    public readonly credentials: LoginDto,
  ) {}
}

/**
 * Manejador para el comando de inicio de sesiu00f3n
 */
@CommandHandler('auth.loginUser')
export class LoginUserHandler implements ICommandHandler<LoginUserCommand, AuthResponseDto> {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
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
    user.updateLastLogin();
    await this.userRepository.update(user.id, user);

    // Generar tokens de acceso y refresco
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Guardar el token de refresco en la base de datos
    await this.userRepository.updateRefreshToken(user.id, refreshToken);

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
