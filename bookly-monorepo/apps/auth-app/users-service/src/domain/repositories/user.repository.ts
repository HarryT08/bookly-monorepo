import { User } from '../entities/user.entity';

/**
 * Interfaz del repositorio para la entidad User
 */
export interface UserRepository {
  /**
   * Busca un usuario por su ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por su email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca todos los usuarios
   */
  findAll(): Promise<User[]>;

  /**
   * Crea un nuevo usuario
   */
  create(userData: Omit<User, '_id'>): Promise<User>;

  /**
   * Actualiza un usuario existente
   */
  update(id: string, userData: Partial<User>): Promise<User | null>;

  /**
   * Elimina un usuario por su ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Actualiza el token de refresco de un usuario
   */
  updateRefreshToken?(userId: string, refreshToken: string | null): Promise<void>;
}
