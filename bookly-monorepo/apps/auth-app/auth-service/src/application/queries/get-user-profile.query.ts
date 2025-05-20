import { IQuery, IQueryHandler, QueryHandler } from '@bookly-monorepo/common';
import { UserResponseDto } from '@bookly-monorepo/dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Inject } from '@nestjs/common';

/**
 * Consulta para obtener el perfil de un usuario
 */
export class GetUserProfileQuery implements IQuery {
  readonly type = 'auth.getUserProfile';
  
  constructor(
    public readonly userId: string,
  ) {}
}

/**
 * Manejador para la consulta de perfil de usuario
 */
@QueryHandler('auth.getUserProfile')
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery, UserResponseDto | null> {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<UserResponseDto | null> {
    const { userId } = query;

    // Buscar el usuario por su ID
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    // Devolver DTO de respuesta
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
