import { IDomainService } from '@bookly-monorepo/common';
import { User } from '../entities/user.entity';

/**
 * Servicio de dominio para la autenticaciu00f3n
 */
export interface AuthService extends IDomainService {
  /**
   * Valida las credenciales de un usuario
   */
  validateCredentials(email: string, password: string): Promise<User | null>;

  /**
   * Genera un hash para una contraseu00f1a
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Compara una contraseu00f1a con su hash
   */
  comparePassword(password: string, hash: string): Promise<boolean>;

  /**
   * Genera un token de acceso JWT
   */
  generateAccessToken(user: User): string;

  /**
   * Genera un token de refresco
   */
  generateRefreshToken(user: User): string;

  /**
   * Valida un token de acceso
   */
  validateAccessToken(token: string): any;

  /**
   * Valida un token de refresco
   */
  validateRefreshToken(token: string): any;
}
