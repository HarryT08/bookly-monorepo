import { Module } from '@nestjs/common';
import { CqrsModule, CommandBus, QueryBus } from '@nestjs/cqrs';

/**
 * Mu00f3dulo para configurar los buses de comandos y consultas
 * Proporciona los buses para la implementaciu00f3n de CQRS
 */
@Module({
  imports: [
    CqrsModule,
  ],
  providers: [
    // Exportar los buses con tokens nombrados para su uso en controladores y servicios
    {
      provide: 'CommandBus',
      useExisting: CommandBus
    },
    {
      provide: 'QueryBus',
      useExisting: QueryBus
    },
  ],
  exports: [
    CqrsModule,
    'CommandBus',
    'QueryBus'
  ],
})
export class BusesModule {}
