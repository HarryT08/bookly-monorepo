import { CommandHandler, ICommandHandler } from '@bookly-monorepo/common';
import { UserResponseDto, UserRole } from '@bookly-monorepo/dto';
import { EventPublisher } from '@bookly-monorepo/event-bus';
import { Inject } from '@nestjs/common';
import { AuthService } from '../../../domain/services/auth.service';
import { RegisterUserCommand } from '../impl/register-user.command';
import { UserServiceProxy } from '../../../infrastructure/proxies/user-service.proxy';
import { RoleServiceProxy } from '../../../infrastructure/proxies/role-service.proxy';
import { IUser } from '../../../domain/interfaces/user.interface';
import { UserRegisteredEvent } from '../../../domain/events/user-events';

/**
 * Manejador para el comando de registro de usuario
 */
@CommandHandler('auth.registerUser')
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, UserResponseDto> {
  constructor(
    private readonly userServiceProxy: UserServiceProxy,
    private readonly roleServiceProxy: RoleServiceProxy,
    @Inject('AuthService') private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponseDto> {
    const { userData } = command;

    // Verificar si el email ya existe
    const existingUser = await this.userServiceProxy.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya existe en el sistema');
    }

    // Hashear la contraseña
    const hashedPassword = await this.authService.hashPassword(userData.password);

    // Asegurar que el rol es un valor válido del enum UserRole
    const roleValue = Object.values(UserRole).includes(userData.role)
      ? userData.role
      : UserRole.USER; // Valor por defecto si no es válido
      
    // Verificar que el rol existe en el sistema
    const roleExists = await this.roleServiceProxy.findRoleByName(roleValue);
    if (!roleExists) {
      // Si el rol no existe, usar el rol por defecto (USER)
      const defaultRole = await this.roleServiceProxy.findRoleByName(UserRole.USER);
      if (!defaultRole) {
        throw new Error('El rol por defecto no existe en el sistema');
      }
    }

    // Crear objeto que cumpla exactamente con la interfaz Omit<IUser, 'id'>
    const userToCreate: Omit<IUser, 'id'> = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: roleValue,
      isActive: true, // Por defecto, el usuario estará activo
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Crear el usuario a través del servicio de usuarios
    const savedUser = await this.userServiceProxy.createUser(userToCreate);

    // Publicar evento de usuario registrado
    const userRegisteredEvent: UserRegisteredEvent = {
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish(
      'auth.user.registered',
      userRegisteredEvent,
    );

    // Devolver UserResponseDto
    const userResponse: UserResponseDto = {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role, // El tipo ya es correcto al venir del repositorio
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    return userResponse;
  }
}
