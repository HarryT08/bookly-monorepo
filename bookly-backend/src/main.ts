import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingService } from '@logging/logging.service';
import { MonitoringService } from '@monitoring/monitoring.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggingService = app.get(LoggingService);
  const monitoringService = app.get(MonitoringService);

  // Initialize monitoring
  monitoringService.initialize();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: configService.get('CORS_CREDENTIALS') === 'true',
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE'))
    .setDescription(configService.get('SWAGGER_DESCRIPTION'))
    .setVersion(configService.get('SWAGGER_VERSION'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(configService.get('SWAGGER_PATH'), app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  loggingService.log(`🚀 Bookly Backend is running on: http://localhost:${port}`);
  loggingService.log(`📚 API Documentation available at: http://localhost:${port}/${configService.get('SWAGGER_PATH')}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});
