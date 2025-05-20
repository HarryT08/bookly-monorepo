import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { PaginatedResponseDto, PaginationDto, UpdateUserDto, UserResponseDto } from '@bookly-monorepo/dto';
import { GetUserProfileQuery } from '../../application/queries/get-user-profile.query';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: any, // Bus de comandos genérico
    private readonly queryBus: any, // Bus de consultas genérico
  ) {}

  /**
   * Obtener todos los usuarios con paginación
   */
  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    try {
      const query = { type: 'auth.getAllUsers', pagination: paginationDto };
      return await this.queryBus.execute(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener un usuario por su ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const query = new GetUserProfileQuery(id);
      const user = await this.queryBus.execute(query);
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Error al obtener usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Actualizar un usuario
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const command = { type: 'auth.updateUser', id, userData: updateUserDto };
      return await this.commandBus.execute(command);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Eliminar un usuario
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      const command = { type: 'auth.deleteUser', id };
      await this.commandBus.execute(command);
      return { success: true };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
