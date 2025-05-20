import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthProxyService } from '../services/auth-proxy.service';
import { Public } from '../../security/public.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  /**
   * Registrar un nuevo usuario
   */
  @Public()
  @Post('register')
  async register(@Body() createUserDto: any) {
    return this.authProxyService.register(createUserDto);
  }

  /**
   * Iniciar sesiu00f3n
   */
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: any) {
    return this.authProxyService.login(loginDto);
  }

  /**
   * Refrescar token
   */
  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenDto: any) {
    return this.authProxyService.refreshToken(refreshTokenDto);
  }

  /**
   * Cerrar sesiu00f3n
   */
  @Post('logout')
  async logout(@Body() logoutDto: any) {
    return this.authProxyService.logout(logoutDto);
  }

  /**
   * Obtener perfil de usuario
   */
  @Get('profile')
  async getProfile(@Req() request: Request) {
    const userId = request['user']?.sub; // El ID del usuario se extrae del token JWT
    return this.authProxyService.getProfile(userId);
  }

  /**
   * Actualizar perfil de usuario
   */
  @Put('profile')
  async updateProfile(@Req() request: Request, @Body() updateUserDto: any) {
    const userId = request['user']?.sub;
    return this.authProxyService.updateProfile(userId, updateUserDto);
  }

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  @Get('users')
  async getAllUsers(@Query() paginationDto: any) {
    return this.authProxyService.getAllUsers(paginationDto);
  }

  /**
   * Obtener un usuario por ID (solo para administradores)
   */
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authProxyService.getUserById(id);
  }

  /**
   * Actualizar un usuario por ID (solo para administradores)
   */
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.authProxyService.updateUser(id, updateUserDto);
  }

  /**
   * Eliminar un usuario por ID (solo para administradores)
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authProxyService.deleteUser(id);
  }
}
