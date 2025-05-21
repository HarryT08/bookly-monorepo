import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './application/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global prefix for the API routes
  app.setGlobalPrefix('api');
  
  // Enable CORS for the application
  app.enableCors();
  
  // Set up global validation pipe to validate DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Set up Swagger for API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Roles Service API')
    .setDescription('API for managing roles and permissions in the Bookly System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Get port from configuration or use default
  const port = configService.get<number>('app.port') || 3002;
  
  // Start the application
  await app.listen(port);
  
  Logger.log(
    `ud83dude80 Roles service is running on: http://localhost:${port}/api`
  );
  Logger.log(
    `ud83dudcdd API Documentation available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
