/**
 * Bookly Auth Service
 * Servicio de autenticaciu00f3n y control de accesos
 */

import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './application/app.module';

async function bootstrap() {
  // Crear la aplicaciu00f3n NestJS
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar prefijo global para las rutas
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Habilitar CORS
  app.enableCors();

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
    .setTitle('Bookly Auth API')
    .setDescription('API para el servicio de autenticaciu00f3n de Bookly')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  // Iniciar el servidor
  const port = configService.get<number>('port') ?? 3001;
  await app.listen(port);

  Logger.log(
    `🚀 Auth Service is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📖 API documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
}

bootstrap();
