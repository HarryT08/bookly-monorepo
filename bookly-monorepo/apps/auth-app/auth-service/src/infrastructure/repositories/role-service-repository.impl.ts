import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IRole } from '../../domain/interfaces/role.interface';
import { RoleServiceRepository } from '../../domain/repositories/role-service.repository';

/**
 * Implementation of RoleServiceRepository that communicates with roles-service
 */
@Injectable()
export class RoleServiceRepositoryImpl implements RoleServiceRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // Get the roles-service URL from configuration
    this.baseUrl = this.configService.get<string>('services.roles.url') || 'http://localhost:3002';
  }

  async findById(id: string): Promise<IRole | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IRole>(`${this.baseUrl}/roles/${id}`)
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByName(name: string): Promise<IRole | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IRole[]>(`${this.baseUrl}/roles?name=${name}`)
      );
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findAll(): Promise<IRole[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<IRole[]>(`${this.baseUrl}/roles`)
    );
    return data;
  }

  async create(role: Omit<IRole, 'id'>): Promise<IRole> {
    const { data } = await firstValueFrom(
      this.httpService.post<IRole>(`${this.baseUrl}/roles`, role)
    );
    return data;
  }

  async update(id: string, role: Partial<IRole>): Promise<IRole | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch<IRole>(`${this.baseUrl}/roles/${id}`, role)
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
        this.httpService.delete(`${this.baseUrl}/roles/${id}`)
      );
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async addPermission(roleId: string, permission: string): Promise<IRole | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<IRole>(`${this.baseUrl}/roles/${roleId}/permissions`, { permission })
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async removePermission(roleId: string, permission: string): Promise<IRole | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete<IRole>(`${this.baseUrl}/roles/${roleId}/permissions/${permission}`)
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
