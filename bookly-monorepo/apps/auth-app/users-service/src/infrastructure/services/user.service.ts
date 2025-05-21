import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CreateUserDto, UpdateUserDto } from '@bookly-monorepo/dto';
import { UserMapper } from '../../domain/dtos/user.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEventsPublisher } from '../event-publishers/user-events.publisher';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly userEventsPublisher: UserEventsPublisher,
    private readonly i18n: I18nService
  ) {}

  async findAll() {
    this.logger.log('Finding all users');
    const users = await this.userRepository.findAll();
    return users.map(user => UserMapper.toDto(user));
  }

  async findById(id: string) {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(this.i18n.translate('USERS.NOT_FOUND'));
    }
    return UserMapper.toDto(user);
  }

  async findByEmail(email: string) {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(this.i18n.translate('USERS.NOT_FOUND'));
    }
    return UserMapper.toDto(user);
  }

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating new user with email: ${createUserDto.email}`);
    
    // Usar directamente el DTO y dejar que el repositorio se encargue de la creación
    const savedUser = await this.userRepository.create(createUserDto as any);

    // Publicar evento de creación de usuario usando el publicador específico
    await this.userEventsPublisher.publishUserCreated(savedUser);

    return UserMapper.toDto(savedUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`);
    // Verificamos primero que exista (lanzará excepción si no existe)
    await this.findById(id);
    
    const updatedUser = await this.userRepository.update(id, updateUserDto);

    // Publicar evento de actualización de usuario usando el publicador específico
    await this.userEventsPublisher.publishUserUpdated(updatedUser, updateUserDto);

    return UserMapper.toDto(updatedUser);
  }

  async remove(id: string) {
    this.logger.log(`Removing user with ID: ${id}`);
    await this.findById(id); // Validate user exists
    await this.userRepository.delete(id);

    // Publicar evento de eliminación de usuario usando el publicador específico
    await this.userEventsPublisher.publishUserDeleted(id);

    return { id, message: this.i18n.translate('USERS.DELETED_SUCCESS') };
  }
}
