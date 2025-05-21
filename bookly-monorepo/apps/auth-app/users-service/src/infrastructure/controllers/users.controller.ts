import { Controller, Get, Post, Body, Param, Put, Delete, Inject } from '@nestjs/common';
// Usamos nuestros buses personalizados en lugar de los de @nestjs/cqrs
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventBusService } from '@bookly-monorepo/event-bus';

// DTOs
import { CreateUserDto, UpdateUserDto } from '@bookly-monorepo/dto';

// Los comandos y queries se implementan directamente con objetos tipo
// No necesitamos importar clases específicas

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('CommandBus') private readonly commandBus: any,
    @Inject('QueryBus') private readonly queryBus: any,
    private readonly eventBus: EventBusService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.commandBus.execute({
      type: 'users.createUser',
      ...createUserDto
    });

    // Publish an event that a user was created
    this.eventBus.publish({
      eventName: 'user.created',
      version: '1.0',
      timestamp: new Date(),
      correlationId: `user-${user.id ?? user._id}`,
      payload: { user }
    });

    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async getAllUsers() {
    return this.queryBus.execute({
      type: 'users.getAllUsers'
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(@Param('id') id: string) {
    return this.queryBus.execute({
      type: 'users.getUserById',
      id
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.commandBus.execute({
      type: 'users.updateUser',
      id,
      ...updateUserDto
    });

    // Publish an event that a user was updated
    this.eventBus.publish({
      eventName: 'user.updated',
      version: '1.0',
      timestamp: new Date(),
      correlationId: `user-${updatedUser.id ?? updatedUser._id}`,
      payload: { user: updatedUser }
    });

    return updatedUser;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(@Param('id') id: string) {
    const result = await this.commandBus.execute({
      type: 'users.deleteUser',
      id
    });

    // Publish an event that a user was deleted
    this.eventBus.publish({
      eventName: 'user.deleted',
      version: '1.0',
      timestamp: new Date(),
      correlationId: `user-${id}`,
      payload: { userId: id }
    });

    return result;
  }
}
