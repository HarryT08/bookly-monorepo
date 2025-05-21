import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './application/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
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
      .setTitle('Users Service API')
      .setDescription('API for managing users of the Bookly System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    // Get port from configuration or use default
    const port = configService.get<number>('app.port') || 3001;
    
    // Start the application
    await app.listen(port);
    
    Logger.log(
      `🚀 Users service is running on: http://localhost:${port}/api`
    );
    Logger.log(
      `📝 API Documentation available at: http://localhost:${port}/api/docs`
    );
  } catch (error) {
    // Mejorar el registro de errores
    const errorMessage = error?.message ?? JSON.stringify(error) ?? 'Unknown error';
    const errorStack = error?.stack ?? 'No stack trace available';
    Logger.error(`Error starting users service: ${errorMessage}`, errorStack);
    // Imprimir más detalles para depuración
    console.error('Full error object:', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  Logger.error(`Unhandled error in bootstrap: ${err.message}`, err.stack);
  process.exit(1);
});
