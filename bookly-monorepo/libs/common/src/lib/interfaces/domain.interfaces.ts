/**
 * Interfaz base para todas las entidades del dominio
 */
export interface IEntity {
  id: string | number;
}

/**
 * Interfaz base para los repositorios en la arquitectura hexagonal
 */
export interface IRepository<T extends IEntity> {
  findById(id: string | number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string | number, entity: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}

/**
 * Interfaz base para los casos de uso en la arquitectura hexagonal
 */
export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

/**
 * Interfaz base para los adaptadores de puerto en la arquitectura hexagonal
 */
export interface IAdapter<Input, Output> {
  adapt(input: Input): Output;
}

/**
 * Interfaz base para los servicios de dominio
 */
export interface IDomainService {
  // Marcar interfaz base para servicios de dominio
}

/**
 * Interfaz para los value objects inmutables
 */
export interface IValueObject {
  equals(valueObject: IValueObject): boolean;
}
