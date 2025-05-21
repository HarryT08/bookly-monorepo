import { IRepository } from '@bookly-monorepo/common';
import { User } from '../entities/user.entity';

/**
 * Repositorio para usuarios en el servicio de autenticación
 */
export interface UserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<User | null>;
}
