import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../infrastructure/controllers/auth.controller';
import { AuthService } from '../infrastructure/services/auth.service';
import { CommandBus } from './buses/cqrs-bus';
import { CustomLoggingModule } from '../infrastructure/logging/custom-logging.module';

@Module({
  imports: [
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
  controllers: [AuthController],
  providers: [
    { provide: 'AuthService', useClass: AuthService },
    { provide: 'CommandBus', useClass: CommandBus }
  ],
  exports: [
    JwtModule,
    { provide: 'AuthService', useClass: AuthService },
    { provide: 'CommandBus', useClass: CommandBus }
  ],
})
export class AuthModule {}
