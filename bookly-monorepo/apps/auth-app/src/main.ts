/**
 * Bookly Auth App - Orquestador Principal
 * Este servicio coordina los microservicios auth-service, users-service y roles-service
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Configurar prefijo global para las rutas
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Habilitar CORS
  app.enableCors();
  
  // Configurar pipes globales para validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Configurar Swagger para documentación de la API
  const options = new DocumentBuilder()
    .setTitle('Bookly Auth App')
    .setDescription('API para orquestar los servicios de autenticación, usuarios y roles de Bookly')
    .setVersion('1.0')
    .addTag('auth-app')
    .addTag('orchestration')
    .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  
  // Obtener puerto de la configuración
  const port = configService.get<number>('app.port') || 3333;
  
  // Iniciar el servidor
  await app.listen(port);
  
  Logger.log(`🚀 Auth App Module is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 API Documentation available at: http://localhost:${port}/${globalPrefix}/docs`);
  Logger.log(`🔧 Service Management available at: http://localhost:${port}/${globalPrefix}/services`);
}

bootstrap();
