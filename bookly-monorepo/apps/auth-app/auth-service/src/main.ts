/**
 * Bookly Auth Service
 * Servicio de autenticaciu00f3n y control de accesos
 */

import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Constantes de la aplicación
import { APP_CONSTANTS } from './infrastructure/constants/app.constants';
import { API_CONSTANTS } from './infrastructure/constants/api.constants';
import { SWAGGER_CONSTANTS } from './infrastructure/constants/swagger.constants';

import { AppModule } from './application/app.module';

// Agregar manejadores globales de excepciones no capturadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // No terminamos el proceso para que Node siga funcionando
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // No terminamos el proceso para que Node siga funcionando
});

async function bootstrap() {
  // Crear la aplicaciu00f3n NestJS
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar prefijo global para las rutas
  const globalPrefix = API_CONSTANTS.GLOBAL_PREFIX;
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
    .setTitle(SWAGGER_CONSTANTS.TITLE)
    .setDescription(SWAGGER_CONSTANTS.DESCRIPTION)
    .setVersion(SWAGGER_CONSTANTS.VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${globalPrefix}/${SWAGGER_CONSTANTS.DOCS_ROUTE}`, app, document);

  // Iniciar el servidor
  const port = configService.get<number>('port') ?? APP_CONSTANTS.DEFAULT_PORT;
  await app.listen(port);

  // Logs con emojis usando las constantes definidas
  Logger.log(
    `${APP_CONSTANTS.LOG_SUCCESS_PREFIX} Auth Service is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `${APP_CONSTANTS.DOCS_PREFIX} API documentation available at: http://localhost:${port}/${globalPrefix}/${SWAGGER_CONSTANTS.DOCS_ROUTE}`
  );
}

bootstrap();
