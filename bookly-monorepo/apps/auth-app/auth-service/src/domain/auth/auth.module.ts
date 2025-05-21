import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importar controladores
import { AuthController } from '../../infrastructure/controllers/auth.controller';

// Importar servicios y repositorios
import { AuthService } from '../../infrastructure/services/auth.service';
import { JwtAuthService } from '../../infrastructure/services/jwt-auth.service';
import { User, UserSchema } from '../entities/user.entity';
import { MongoDbUserRepository } from '../../infrastructure/repositories/mongodb-user.repository';

// Importar proxies para comunicaciu00f3n con otros servicios
import { UserServiceProxy } from '../../infrastructure/proxies/user-service.proxy';
import { RoleServiceProxy } from '../../infrastructure/proxies/role-service.proxy';

// Importar mu00f3dulo de event handlers
import { EventHandlersModule } from '../../infrastructure/event-handlers/event-handlers.module';

@Module({
  imports: [
    // Configurar el esquema de mongoose para User
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    
    // Configurar JwtModule con las opciones del servicio
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get<string>('jwt.accessExpiration') },
      }),
      inject: [ConfigService],
    }),
    
    // Importar el mu00f3dulo de event handlers
    EventHandlersModule,
  ],
  controllers: [AuthController],
  providers: [
    // Servicios de dominio
    {
      provide: 'AuthService',
      useClass: AuthService,
    },
    JwtAuthService,
    
    // Repositorios
    {
      provide: 'UserRepository',
      useClass: MongoDbUserRepository,
    },
    
    // Proxies para comunicaciu00f3n con otros servicios
    UserServiceProxy,
    RoleServiceProxy,
    
    // Los event handlers ahora se gestionan a travu00e9s del EventHandlersModule
  ],
  exports: [
    'AuthService',
    JwtAuthService,
    'UserRepository',
  ],
})
export class AuthModule {}
