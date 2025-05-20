/**
 * Interfaz base para todos los comandos en la arquitectura CQRS
 */
export interface ICommand {
  readonly type: string;
}

/**
 * Interfaz para los manejadores de comandos
 */
export interface ICommandHandler<T extends ICommand, R = any> {
  execute(command: T): Promise<R>;
}

/**
 * Interfaz base para todas las consultas en la arquitectura CQRS
 */
export interface IQuery {
  readonly type: string;
}

/**
 * Interfaz para los manejadores de consultas
 */
export interface IQueryHandler<T extends IQuery, R = any> {
  execute(query: T): Promise<R>;
}

/**
 * Decorador para marcar una clase como manejador de comandos
 */
export function CommandHandler(commandType: string) {
  return function (target: any) {
    Reflect.defineMetadata('commandType', commandType, target);
  };
}

/**
 * Decorador para marcar una clase como manejador de consultas
 */
export function QueryHandler(queryType: string) {
  return function (target: any) {
    Reflect.defineMetadata('queryType', queryType, target);
  };
}
