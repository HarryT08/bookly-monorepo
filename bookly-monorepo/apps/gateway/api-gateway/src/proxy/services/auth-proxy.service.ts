import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthProxyService {
  private readonly logger = new Logger(AuthProxyService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('services.auth');
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(createUserDto: any) {
    this.logger.debug(`Forwarding register request to auth service: ${this.baseUrl}/register`);
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/register`, createUserDto)
    );
    return data;
  }

  /**
   * Iniciar sesiu00f3n
   */
  async login(loginDto: any) {
    this.logger.debug(`Forwarding login request to auth service: ${this.baseUrl}/login`);
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/login`, loginDto)
    );
    return data;
  }

  /**
   * Refrescar token
   */
  async refreshToken(refreshTokenDto: any) {
    this.logger.debug(`Forwarding refresh-token request to auth service: ${this.baseUrl}/refresh-token`);
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/refresh-token`, refreshTokenDto)
    );
    return data;
  }

  /**
   * Cerrar sesiu00f3n
   */
  async logout(logoutDto: any) {
    this.logger.debug(`Forwarding logout request to auth service: ${this.baseUrl}/logout`);
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/logout`, logoutDto)
    );
    return data;
  }

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: string) {
    this.logger.debug(`Forwarding get profile request to auth service: ${this.baseUrl}/users/${userId}`);
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/users/${userId}`)
    );
    return data;
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, updateUserDto: any) {
    this.logger.debug(`Forwarding update profile request to auth service: ${this.baseUrl}/users/${userId}`);
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.baseUrl}/users/${userId}`, updateUserDto)
    );
    return data;
  }

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(paginationDto: any) {
    this.logger.debug(`Forwarding get all users request to auth service: ${this.baseUrl}/users`);
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/users`, { params: paginationDto })
    );
    return data;
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: string) {
    this.logger.debug(`Forwarding get user by id request to auth service: ${this.baseUrl}/users/${id}`);
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/users/${id}`)
    );
    return data;
  }

  /**
   * Actualizar un usuario por ID
   */
  async updateUser(id: string, updateUserDto: any) {
    this.logger.debug(`Forwarding update user request to auth service: ${this.baseUrl}/users/${id}`);
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.baseUrl}/users/${id}`, updateUserDto)
    );
    return data;
  }

  /**
   * Eliminar un usuario por ID
   */
  async deleteUser(id: string) {
    this.logger.debug(`Forwarding delete user request to auth service: ${this.baseUrl}/users/${id}`);
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.baseUrl}/users/${id}`)
    );
    return data;
  }
}
