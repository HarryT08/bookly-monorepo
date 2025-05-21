import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../../domain/interfaces/user.interface';
import { UserServiceRepository } from '../../domain/repositories/user-service.repository';

/**
 * Implementation of UserServiceRepository that communicates with users-service
 */
@Injectable()
export class UserServiceRepositoryImpl implements UserServiceRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // Get the users-service URL from configuration
    this.baseUrl = this.configService.get<string>('services.users.url') || 'http://localhost:3001';
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IUser>(`${this.baseUrl}/users/${id}`)
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IUser[]>(`${this.baseUrl}/users?email=${email}`)
      );
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findAll(): Promise<IUser[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<IUser[]>(`${this.baseUrl}/users`)
    );
    return data;
  }

  async create(user: Omit<IUser, 'id'>): Promise<IUser> {
    const { data } = await firstValueFrom(
      this.httpService.post<IUser>(`${this.baseUrl}/users`, user)
    );
    return data;
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch<IUser>(`${this.baseUrl}/users/${id}`, user)
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/users/${id}`)
      );
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await firstValueFrom(
      this.httpService.patch(`${this.baseUrl}/users/${userId}/refresh-token`, { refreshToken })
    );
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IUser[]>(`${this.baseUrl}/users?refreshToken=${refreshToken}`)
      );
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
