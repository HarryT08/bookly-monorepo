import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain
import { UserRepository } from './domain/repositories/user.repository';
import { RoleRepository } from './domain/repositories/role.repository';

// Application
import { LoginHandler } from './application/commands/handlers/login.handler';
import { RegisterHandler } from './application/commands/handlers/register.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { GetUsersHandler } from './application/queries/handlers/get-users.handler';
import { AuthService } from './application/services/auth.service';
import { UserService } from './application/services/user.service';
import { RoleService } from './application/services/role.service';

// Infrastructure
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UserController } from './infrastructure/controllers/user.controller';
import { RoleController } from './infrastructure/controllers/role.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';

const CommandHandlers = [LoginHandler, RegisterHandler];
const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UserController, RoleController],
  providers: [
    // Services
    AuthService,
    UserService,
    RoleService,

    // Strategies
    JwtStrategy,
    LocalStrategy,

    // Repositories
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: RoleRepository,
      useClass: PrismaRoleRepository,
    },

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuthService, UserService, RoleService],
})
export class AuthModule {}
