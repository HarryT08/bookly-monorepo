import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nModule } from 'nestjs-i18n';
import { APP_GUARD } from '@nestjs/core';
// Ya no usamos el LoggingModule original sino nuestro CustomLoggingModule
import { CustomLoggingModule } from '../infrastructure/logging/custom-logging.module';
import { CommonModule } from '@bookly-monorepo/common';
import { EventBusModule } from '@bookly-monorepo/event-bus';
import { DtoModule } from '@bookly-monorepo/dto';
import { BusesModule } from './buses/buses.module';

// Import the service-specific modules
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { RolesModule } from './roles.module';

// Import guards and strategies
import { JwtStrategy } from '../infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../infrastructure/guards/roles.guard';

// Import middleware
import { AuditMiddleware } from '../infrastructure/middlewares/audit.middleware';

// Import configuration
import configuration from '../infrastructure/config/configuration';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri') || 'mongodb://user:pass@localhost:27017',
      }),
      inject: [ConfigService],
    }),

    // i18n support
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: { path: 'libs/i18n/translations/', watch: true },
    }),

    // Shared modules
    CommonModule.register(),
    EventBusModule.register({
      serviceName: 'auth-service',
    }),
    CustomLoggingModule,
    DtoModule,
    BusesModule,

    // Service-specific modules
    AuthModule,
    UsersModule,
    RolesModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
