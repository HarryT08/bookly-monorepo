import { UserRole } from './user.dto';

/**
 * Interfaz que describe un usuario en el sistema
 * Esta interfaz es compartida entre servicios y permite desacoplar
 * la implementación específica en users-service de los consumidores
 */
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
