import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findByUsername(username);
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{
    users: UserEntity[];
    total: number;
  }> {
    return this.userRepository.findAll(page, limit, search);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.create(user);
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    return this.userRepository.update(id, user);
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.userRepository.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.userRepository.removeRole(userId, roleId);
  }

  async findByIdWithRoles(id: string): Promise<UserEntity | null> {
    return this.userRepository.findByIdWithRoles(id);
  }
}
