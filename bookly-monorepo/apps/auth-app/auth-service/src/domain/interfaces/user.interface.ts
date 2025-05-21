/**
 * Interface that mirrors the User entity from users-service
 * This allows auth-service to be independent but use the same structure
 */
export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  role: string;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
