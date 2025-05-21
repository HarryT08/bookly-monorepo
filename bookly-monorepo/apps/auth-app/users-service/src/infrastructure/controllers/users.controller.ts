import { Controller, Get, Post, Body, Param, Put, Delete, Inject, Logger, OnModuleInit } from '@nestjs/common';
// Usamos nuestros buses personalizados en lugar de los de @nestjs/cqrs
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventBusService } from '@bookly-monorepo/event-bus';

// DTOs
import { CreateUserDto, UpdateUserDto } from '@bookly-monorepo/dto';

// Los comandos y queries se implementan directamente con objetos tipo
// No necesitamos importar clases específicas

@ApiTags('users')
@Controller('users')
export class UsersController implements OnModuleInit {
  private readonly logger = new Logger(UsersController.name);
  private eventBusInitialized = false;
  constructor(
    @Inject('CommandBus') private readonly commandBus: any,
    @Inject('QueryBus') private readonly queryBus: any,
    private readonly eventBus: EventBusService,
  ) {}
  
  /**
   * Inicializa conexiu00f3n con el EventBus al arrancar el controlador
   */
  async onModuleInit() {
    try {
      // Intentamos verificar la conexiu00f3n al bus de eventos
      this.logger.log('Initializing EventBus connection...');
      // Aseguramos que el EventBus estu00e1 listo para publicar eventos
      await this.eventBus.onModuleInit?.();
      this.eventBusInitialized = true;
      this.logger.log('EventBus connection successfully initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize EventBus: ${error.message}`, error.stack);
      // No lanzamos excepciu00f3n para permitir que la aplicaciu00f3n siga funcionando
      // aunque el bus de eventos no estu00e9 disponible
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.commandBus.execute({
        type: 'users.createUser',
        ...createUserDto
      });

      // Publish an event that a user was created (solo si el bus de eventos estu00e1 inicializado)
      if (this.eventBusInitialized) {
        try {
          await this.eventBus.publish({
            eventName: 'user.created',
            version: '1.0',
            timestamp: new Date(),
            correlationId: `user-${user.id ?? user._id}`,
            payload: { user }
          });
        } catch (eventError) {
          this.logger.warn(`Could not publish user.created event: ${eventError.message}`);
          // Continuamos a pesar del error en la publicaciu00f3n del evento
        }
      }

      return user;
    } catch (error) {
      Logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async getAllUsers() {
    try {
      return await this.queryBus.execute({
        type: 'users.getAllUsers'
      });
    } catch (error) {
      Logger.error(`Error getting all users: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(@Param('id') id: string) {
    try {
      return await this.queryBus.execute({
        type: 'users.getUserById',
        id
      });
    } catch (error) {
      Logger.error(`Error getting user by id: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.commandBus.execute({
        type: 'users.updateUser',
        id,
        ...updateUserDto
      });

      // Publish an event that a user was updated (solo si el bus de eventos estu00e1 inicializado)
      if (this.eventBusInitialized) {
        try {
          await this.eventBus.publish({
            eventName: 'user.updated',
            version: '1.0',
            timestamp: new Date(),
            correlationId: `user-${updatedUser.id ?? updatedUser._id}`,
            payload: { user: updatedUser }
          });
        } catch (eventError) {
          this.logger.warn(`Could not publish user.updated event: ${eventError.message}`);
          // Continuamos a pesar del error en la publicaciu00f3n del evento
        }
      }

      return updatedUser;
    } catch (error) {
      Logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(@Param('id') id: string) {
    try {
      const result = await this.commandBus.execute({
        type: 'users.deleteUser',
        id
      });

      // Publish an event that a user was deleted (solo si el bus de eventos estu00e1 inicializado)
      if (this.eventBusInitialized) {
        try {
          await this.eventBus.publish({
            eventName: 'user.deleted',
            version: '1.0',
            timestamp: new Date(),
            correlationId: `user-${id}`,
            payload: { userId: id }
          });
        } catch (eventError) {
          this.logger.warn(`Could not publish user.deleted event: ${eventError.message}`);
          // Continuamos a pesar del error en la publicaciu00f3n del evento
        }
      }

      return result;
    } catch (error) {
      Logger.error(`Error deleting user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
