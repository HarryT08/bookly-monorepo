import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { AuthProxyService } from './services/auth-proxy.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    // Opcionalmente podemos usar microservicios en lugar de HTTP
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: 3001,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthProxyController],
  providers: [AuthProxyService],
  exports: [AuthProxyService],
})
export class AuthProxyModule {}
