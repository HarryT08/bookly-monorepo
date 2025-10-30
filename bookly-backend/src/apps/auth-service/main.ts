import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as compression from "compression";
import helmet from "helmet";
import { AuthAloneModule } from "./auth.alone.module";

async function bootstrap() {
  const logger = new Logger("AuthService");

  try {
    // Create NestJS application
    const app = await NestFactory.create(AuthAloneModule, {
      logger: ["error", "warn", "log", "debug", "verbose"],
    });

    // Get configuration service
    const configService = app.get(ConfigService);
    const port = configService.get<number>("auth.service.port", 3001);
    // En Docker usar 0.0.0.0, en desarrollo local puede usar localhost
    const host = configService.get<string>("SERVICE_HOST", process.env.SERVICE_HOST || "0.0.0.0");
    const environment = configService.get<string>("NODE_ENV", "development");

    // Global prefix
    app.setGlobalPrefix("api/v1");

    // Security middleware
    if (environment === "production") {
      app.use(helmet());
    }

    // Compression
    app.use(compression());

    // CORS configuration
    const corsOrigins = configService.get<string[]>("auth.cors.origin", [
      "http://localhost:3000",
    ]);
    app.enableCors({
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Swagger documentation
    const swaggerEnabled = configService.get<boolean>(
      "auth.swagger.enabled",
      true
    );
    if (swaggerEnabled) {
      const config = new DocumentBuilder()
        .setTitle("Bookly Auth Service")
        .setDescription(
          "Authentication and authorization service for Bookly reservation system"
        )
        .setVersion("1.0.0")
        .addBearerAuth(
          {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "JWT",
            description: "Enter JWT token",
            in: "header",
          },
          "JWT-auth"
        )
        .addOAuth2(
          {
            type: "oauth2",
            flows: {
              authorizationCode: {
                authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
                tokenUrl: "https://oauth2.googleapis.com/token",
                scopes: {
                  openid: "OpenID Connect",
                  profile: "Profile information",
                  email: "Email address",
                },
              },
            },
          },
          "google-oauth"
        )
        .addTag("Authentication", "User authentication endpoints")
        .addTag("Users", "User management endpoints")
        .addTag("Roles", "Role and permission management")
        .addTag("OAuth", "OAuth2 authentication endpoints")
        .addTag("Health", "Service health check endpoints")
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: "alpha",
          operationsSorter: "alpha",
        },
      });

      logger.log(
        `Swagger documentation available at http://${host}:${port}/api/docs`
      );
    }

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.log("SIGTERM received, shutting down gracefully...");
      await app.close();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.log("SIGINT received, shutting down gracefully...");
      await app.close();
      process.exit(0);
    });

    // Start the server
    await app.listen(port, host);

    logger.log(`🚀 Auth Service is running on: http://${host}:${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
    logger.log(`🔐 JWT Authentication enabled`);
    logger.log(`🌐 OAuth2 Google SSO enabled`);
  } catch (error) {
    logger.error("Failed to start Auth Service:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  const logger = new Logger("UnhandledRejection");
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  const logger = new Logger("UncaughtException");
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

bootstrap();
