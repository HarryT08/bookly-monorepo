import { IUser } from '../interfaces/user.interface';

/**
 * Interface for the UserService repository
 * This defines how auth-service will interact with users-service
 */
export interface UserServiceRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(user: Omit<IUser, 'id'>): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
  updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<IUser | null>;
}
