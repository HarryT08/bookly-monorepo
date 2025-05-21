/**
 * Interface that mirrors the Role entity from roles-service
 * This allows auth-service to be independent but use the same structure
 */
export interface IRole {
  id?: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
