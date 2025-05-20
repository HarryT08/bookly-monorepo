import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '@bookly-monorepo/common';

// Configuración
import configuration from '../config/configuration';

// Proxies para los microservicios
import { AuthProxyModule } from '../proxy/auth-proxy.module';
import { ResourcesProxyModule } from '../proxy/resources-proxy.module';
import { AvailabilityProxyModule } from '../proxy/availability-proxy.module';
import { StockpileProxyModule } from '../proxy/stockpile-proxy.module';
import { ReportsProxyModule } from '../proxy/reports-proxy.module';
import { NotificationsProxyModule } from '../proxy/notifications-proxy.module';

// Seguridad
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';

// Controladores para health checks
import { HealthController } from '../health/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // JWT para verificación de tokens
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('security.jwtAccessSecret'),
      }),
      inject: [ConfigService],
    }),
    
    // Módulos compartidos
    CommonModule.register(),
    
    // Health checking
    TerminusModule,
    HttpModule,
    
    // Proxies de microservicios
    AuthProxyModule,
    ResourcesProxyModule,
    AvailabilityProxyModule,
    StockpileProxyModule,
    ReportsProxyModule,
    NotificationsProxyModule,
  ],
  controllers: [
    HealthController,
  ],
  providers: [
    // Guardias globales para JWT y roles
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class GatewayModule {}
