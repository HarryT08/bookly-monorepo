import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

/**
 * Bus de comandos para la arquitectura CQRS
 */
@Injectable()
export class CommandBus {
  private handlers = new Map<string, any>();

  constructor(private moduleRef: ModuleRef) {}

  /**
   * Registra un manejador de comandos
   */
  registerHandler(commandType: string, handler: any): void {
    this.handlers.set(commandType, handler);
  }

  /**
   * Ejecuta un comando llamando a su manejador correspondiente
   */
  async execute<T, R>(command: { type: string } & T): Promise<R> {
    const { type } = command;
    const handlerClass = this.handlers.get(type);

    if (!handlerClass) {
      throw new Error(`No handler registered for command type ${type}`);
    }

    // Resolver el handler desde el contexto de DI de NestJS
    const handler = await this.moduleRef.resolve(handlerClass);
    return handler.execute(command);
  }

  /**
   * Hook que NestJS llama cuando el mu00f3dulo se inicializa
   */
  async onModuleInit() {
    // En versiones recientes de NestJS, introspect requiere un token
    // Como este es un ejemplo/código simulado, simplemente comentamos esto por ahora
    // y lo implementamos manualmente cuando sea necesario
    
    // const providers = this.moduleRef.introspect(/* token */);

    // Por simplicidad, haremos esto manualmente en onModuleInit de cada handler
    // Ejemplo de cómo se registraría manualmente:
    // const loginHandler = await this.moduleRef.resolve(LoginUserHandler);
    // this.registerHandler('auth.loginUser', loginHandler);
  }
}

/**
 * Bus de consultas para la arquitectura CQRS
 */
@Injectable()
export class QueryBus {
  private handlers = new Map<string, any>();

  constructor(private moduleRef: ModuleRef) {}

  /**
   * Registra un manejador de consultas
   */
  registerHandler(queryType: string, handler: any): void {
    this.handlers.set(queryType, handler);
  }

  /**
   * Ejecuta una consulta llamando a su manejador correspondiente
   */
  async execute<T, R>(query: { type: string } & T): Promise<R> {
    const { type } = query;
    const handlerClass = this.handlers.get(type);

    if (!handlerClass) {
      throw new Error(`No handler registered for query type ${type}`);
    }

    // Resolver el handler desde el contexto de DI de NestJS
    const handler = await this.moduleRef.resolve(handlerClass);
    return handler.execute(query);
  }

  /**
   * Hook que NestJS llama cuando el mu00f3dulo se inicializa
   */
  async onModuleInit() {
    // Similar a CommandBus, aquí usaremos una implementación manual
    // El método introspect en versiones recientes requiere un token
    
    // Ejemplo de cómo se registraría manualmente:
    // const profileHandler = await this.moduleRef.resolve(GetUserProfileHandler);
    // this.registerHandler('auth.getUserProfile', profileHandler);
  }
}
