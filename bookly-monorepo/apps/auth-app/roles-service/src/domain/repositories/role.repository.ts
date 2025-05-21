import { Role } from '../entities/role.entity';

/**
 * Interfaz del repositorio para la entidad Role
 */
export interface RoleRepository {
  /**
   * Busca un rol por su ID
   */
  findById(id: string): Promise<Role | null>;

  /**
   * Busca un rol por su nombre
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * Busca todos los roles
   */
  findAll(): Promise<Role[]>;

  /**
   * Crea un nuevo rol
   */
  create(roleData: Omit<Role, '_id'>): Promise<Role>;

  /**
   * Actualiza un rol existente
   */
  update(id: string, roleData: Partial<Role>): Promise<Role | null>;

  /**
   * Elimina un rol por su ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Asigna un rol a un usuario
   */
  assignToUser?(userId: string, roleId: string): Promise<void>;
}
