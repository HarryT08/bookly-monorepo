import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommandBus } from './buses/cqrs-bus';
import { CustomLoggingModule } from '../infrastructure/logging/custom-logging.module';

// Will need user controller & service creation in future steps
@Module({
  imports: [
    MongooseModule.forFeature([
      // User schema will be defined properly when implemented
      // { name: 'User', schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get<string>('jwt.accessExpiration') },
      }),
      inject: [ConfigService],
    }),
    CustomLoggingModule,
  ],
  controllers: [],
  providers: [
    // To be replaced with actual UserService when implemented
    // UserService,
    { provide: 'CommandBus', useClass: CommandBus }
  ],
  exports: [
    // To be exported when implemented
    // UserService
  ],
})
export class UsersModule {}
