import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '@bookly-monorepo/common';
import { EventBusModule } from '@bookly-monorepo/event-bus';
import { DtoModule } from '@bookly-monorepo/dto';

// Comandos y Queries
import { RegisterUserHandler } from '../application/commands/register-user.command';
import { LoginUserHandler } from '../application/commands/login-user.command';
import { GetUserProfileHandler } from '../application/queries/get-user-profile.query';

// Controladores
import { AuthController } from '../infrastructure/controllers/auth.controller';
import { UsersController } from '../infrastructure/controllers/users.controller';

// Servicios e implementaciones
import { JwtAuthService } from '../infrastructure/services/jwt-auth.service';
import { MongoDBUserRepository, UserSchema } from '../infrastructure/repositories/mongodb-user.repository';

// Configuración
import configuration from '../infrastructure/config/configuration';

// Bus de comandos y consultas
import { CommandBus, QueryBus } from './buses/cqrs-bus';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
    
    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get<string>('jwt.accessExpiration') },
      }),
      inject: [ConfigService],
    }),
    
    // Módulos compartidos
    CommonModule.register(),
    EventBusModule.register({
      serviceName: 'auth-service',
    }),
    DtoModule,
  ],
  controllers: [
    AuthController,
    UsersController,
  ],
  providers: [
    // Bus de comandos y consultas
    CommandBus,
    QueryBus,
    
    // Handlers de comandos
    RegisterUserHandler,
    LoginUserHandler,
    
    // Handlers de consultas
    GetUserProfileHandler,
    
    // Servicios
    {
      provide: 'AuthService',
      useClass: JwtAuthService,
    },
    
    // Repositorios
    {
      provide: 'UserRepository',
      useClass: MongoDBUserRepository,
    },
  ],
})
export class AuthModule {}
