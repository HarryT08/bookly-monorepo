import { UserEntity } from '../entities/user.entity';

export abstract class UserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByUsername(username: string): Promise<UserEntity | null>;
  abstract findAll(page?: number, limit?: number, search?: string): Promise<{
    users: UserEntity[];
    total: number;
  }>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
  abstract assignRole(userId: string, roleId: string): Promise<void>;
  abstract removeRole(userId: string, roleId: string): Promise<void>;
  abstract findByIdWithRoles(id: string): Promise<UserEntity | null>;
}
