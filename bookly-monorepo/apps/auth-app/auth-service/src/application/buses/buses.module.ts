import { Module } from '@nestjs/common';
import { CommandBus, QueryBus } from './cqrs-bus';

@Module({
  providers: [
    { provide: 'CommandBus', useClass: CommandBus },
    { provide: 'QueryBus', useClass: QueryBus },
  ],
  exports: [
    { provide: 'CommandBus', useClass: CommandBus },
    { provide: 'QueryBus', useClass: QueryBus },
  ],
})
export class BusesModule {}
