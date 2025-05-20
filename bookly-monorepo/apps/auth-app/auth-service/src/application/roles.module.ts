import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from '../infrastructure/controllers/roles.controller';
import { RolesService } from '../infrastructure/services/roles.service';
import { CommandBus } from './buses/cqrs-bus';
import { CustomLoggingModule } from '../infrastructure/logging/custom-logging.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      // Role schema will be defined properly when implemented
      // { name: 'Role', schema: RoleSchema },
    ]),
    CustomLoggingModule,
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    { provide: 'CommandBus', useClass: CommandBus }
  ],
  exports: [
    RolesService
  ],
})
export class RolesModule {}
