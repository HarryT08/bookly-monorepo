/**
 * Bookly API Gateway
 * Puerta de enlace para unificar todas las peticiones externas
 */

import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GatewayModule } from './app/gateway.module';

async function bootstrap() {
  // Crear la aplicaciu00f3n NestJS
  const app = await NestFactory.create(GatewayModule);
  const configService = app.get(ConfigService);
  
  // Configurar prefijo global para las rutas
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Habilitar CORS para permitir peticiones desde el frontend
  const corsOrigins = configService.get<string[]>('security.corsOrigins');
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  
  // Configurar Pipes globales para validaciu00f3n
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Configurar Swagger para documentaciu00f3n de la API
  const options = new DocumentBuilder()
    .setTitle('Bookly API')
    .setDescription('API para el sistema de reservas institucionales Bookly')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticaciu00f3n')
    .addTag('resources', 'Endpoints de recursos y espacios')
    .addTag('availability', 'Endpoints de reservas y disponibilidad')
    .addTag('stockpile', 'Endpoints de workflow de aprobaciones')
    .addTag('reports', 'Endpoints de reportes y estadu00edsticas')
    .addTag('notifications', 'Endpoints de notificaciones')
    .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  
  // Iniciar el servidor
  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  
  Logger.log(
    `ud83dude80 API Gateway is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `ud83dudcd6 API documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
}

bootstrap();
