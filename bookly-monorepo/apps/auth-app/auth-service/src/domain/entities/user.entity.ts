import { IEntity } from '@bookly-monorepo/common';
import { UserRole } from '@bookly-monorepo/dto';

/**
 * Entidad de dominio para los usuarios
 */
export class User implements IEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    isActive?: boolean;
    lastLogin?: Date;
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = params.email;
    this.password = params.password;
    this.role = params.role || UserRole.USER;
    this.isActive = params.isActive ?? true;
    this.lastLogin = params.lastLogin;
    this.refreshToken = params.refreshToken;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  /**
   * Actualiza los datos del usuario
   */
  update(params: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    lastLogin: Date;
    refreshToken: string;
  }>): void {
    if (params.firstName) this.firstName = params.firstName;
    if (params.lastName) this.lastName = params.lastName;
    if (params.email) this.email = params.email;
    if (params.password) this.password = params.password;
    if (params.role) this.role = params.role;
    if (params.isActive !== undefined) this.isActive = params.isActive;
    if (params.lastLogin) this.lastLogin = params.lastLogin;
    if (params.refreshToken) this.refreshToken = params.refreshToken;
    this.updatedAt = new Date();
  }

  /**
   * Desactiva la cuenta de usuario
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Activa la cuenta de usuario
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Actualiza la fecha del u00faltimo inicio de sesiu00f3n
   */
  updateLastLogin(): void {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
