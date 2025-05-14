import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { I18nModule } from 'nestjs-i18n';
import { Logger } from '@bookly-monorepo/logging';
import { AuditMiddleware } from './middlewares/audit.middleware';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: { path: 'libs/i18n/translations/', watch: true },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, RolesController],
  providers: [
    AuthService,
    RolesService,
    JwtStrategy,
    Logger,
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
