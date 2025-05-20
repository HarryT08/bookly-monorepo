import { CommandHandler, ICommand, ICommandHandler } from '@bookly-monorepo/common';
import { CreateUserDto, UserResponseDto } from '@bookly-monorepo/dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthService } from '../../domain/services/auth.service';
import { EventPublisher } from '@bookly-monorepo/event-bus';
import { Inject } from '@nestjs/common';

/**
 * Comando para registrar un nuevo usuario
 */
export class RegisterUserCommand implements ICommand {
  readonly type = 'auth.registerUser';
  
  constructor(
    public readonly userData: CreateUserDto,
  ) {}
}

/**
 * Manejador para el comando de registro de usuario
 */
@CommandHandler('auth.registerUser')
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, UserResponseDto> {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('AuthService') private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponseDto> {
    const { userData } = command;

    // Verificar si el email ya exu00edste
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya exu00edste en el sistema');
    }

    // Hashear la contraseu00f1a
    const hashedPassword = await this.authService.hashPassword(userData.password);

    // Crear el usuario en el dominio
    const user = new User({
      id: uuidv4(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    });

    // Persistir el usuario
    const savedUser = await this.userRepository.create(user);

    // Publicar evento de usuario creado
    await this.eventPublisher.publish(
      'user.created',
      {
        userId: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
    );

    // Devolver DTO de respuesta
    return {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}
