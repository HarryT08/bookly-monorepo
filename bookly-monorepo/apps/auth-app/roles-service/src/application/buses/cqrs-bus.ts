import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

/**
 * Bus de comandos para la arquitectura CQRS
 */
@Injectable()
export class CommandBus {
  private readonly handlers = new Map<string, any>();

  constructor(private readonly moduleRef: ModuleRef) {}

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
   * Hook que NestJS llama cuando el módulo se inicializa
   */
  async onModuleInit() {
    try {
      // Los handlers deberán registrarse manualmente en onModuleInit de cada handler
      // Ejemplo de cómo se registraría manualmente:
      // const createRoleHandler = await this.moduleRef.resolve(CreateRoleHandler);
      // this.registerHandler('roles.createRole', createRoleHandler);
    } catch (error) {
      console.error('Error inicializando CommandBus:', error);
    }
  }
}

/**
 * Bus de consultas para la arquitectura CQRS
 */
@Injectable()
export class QueryBus {
  private readonly handlers = new Map<string, any>();

  constructor(private readonly moduleRef: ModuleRef) {}

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
   * Hook que NestJS llama cuando el módulo se inicializa
   */
  async onModuleInit() {
    try {
      // Los handlers deberán registrarse manualmente cuando se inicialice:
      // const getRoleHandler = await this.moduleRef.resolve(GetRoleHandler);
      // this.registerHandler('roles.getRole', getRoleHandler);
    } catch (error) {
      console.error('Error inicializando QueryBus:', error);
    }
  }
}
