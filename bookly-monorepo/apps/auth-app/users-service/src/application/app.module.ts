import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nModule, I18nJsonLoader, AcceptLanguageResolver, HeaderResolver, QueryResolver } from 'nestjs-i18n';
import { EventBusModule } from '@bookly-monorepo/event-bus';
import { CommonModule } from '@bookly-monorepo/common';
import { DtoModule } from '@bookly-monorepo/dto';
import * as path from 'path';

// Import users module
import { UsersModule } from './users.module';

// Import buses module
import { BusesModule } from './buses/buses.module';

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
          includePaths: ['es/auth-app/users-service.json'],
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
    EventBusModule.register({
      serviceName: 'users-service',
      rabbitmqUrl: process.env.RABBITMQ_URI,
    }),
    DtoModule,

    // Service-specific modules
    UsersModule,
    
    // CQRS buses
    BusesModule,
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
