import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nModule, I18nJsonLoader, AcceptLanguageResolver, HeaderResolver, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { APP_GUARD } from '@nestjs/core';
// Ya no usamos el LoggingModule original sino nuestro CustomLoggingModule
import { CustomLoggingModule } from '../infrastructure/logging/custom-logging.module';
import { CommonModule } from '@bookly-monorepo/common';
import { EventBusModule } from '@bookly-monorepo/event-bus';
import { DtoModule } from '@bookly-monorepo/dto';
import { BusesModule } from './buses/buses.module';

// Import the auth module only, as users and roles are now separate services
import { AuthModule } from './auth.module';

// Import guards and strategies
import { JwtStrategy } from '../infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';

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
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('app.defaultLanguage') ?? 'es',
        loaderOptions: {
          path: path.join(process.cwd(), 'libs/i18n/translations/'),
          includePaths: ['es/auth-app/auth-service.json'],
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      loader: I18nJsonLoader,
      inject: [ConfigService],
    }),

    // Shared modules
    CommonModule.register(),
    // Solo registrar EventBusModule si no estamos en desarrollo
    // o si explícitamente hay una URL de RabbitMQ configurada
    ...(process.env.NODE_ENV !== 'development' || process.env.RABBITMQ_URI ? [
      EventBusModule.register({
        serviceName: 'auth-service',
        rabbitmqUrl: process.env.RABBITMQ_URI,
      })
    ] : []),
    CustomLoggingModule,
    DtoModule,
    BusesModule,

    // Service-specific modules
    AuthModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Role-based authorization is now handled by the roles service
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
