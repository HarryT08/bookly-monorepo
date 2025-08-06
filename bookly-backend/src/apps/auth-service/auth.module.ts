import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';

// Domain
import { UserRepository } from '@apps/auth-service/domain/repositories/user.repository';
import { RoleRepository } from '@apps/auth-service/domain/repositories/role.repository';
import { PermissionRepository } from '@apps/auth-service/domain/repositories/permission.repository';

// Application
import { LoginHandler } from '@/apps/auth-service/application/handlers/login.handler';
import { GetUserHandler } from '@/apps/auth-service/application/handlers/get-user.handler';
import { GetUsersHandler } from '@/apps/auth-service/application/handlers/get-users.handler';
import { AuthService } from '@apps/auth-service/application/services/auth.service';
import { UserService } from '@apps/auth-service/application/services/user.service';
import { RoleService } from '@apps/auth-service/application/services/role.service';
import { PermissionService } from '@apps/auth-service/application/services/permission.service';

// Infrastructure
import { AuthController } from '@apps/auth-service/infrastructure/controllers/auth.controller';
import { UserController } from '@apps/auth-service/infrastructure/controllers/user.controller';
import { RoleController } from '@apps/auth-service/infrastructure/controllers/role.controller';
import { PermissionController } from '@apps/auth-service/infrastructure/controllers/permission.controller';
import { OAuthController } from '@apps/auth-service/infrastructure/controllers/oauth.controller';
import { SSOConfigGuard } from './infrastructure/guards/sso-config.guard';
import { ResourceModificationGuard } from './infrastructure/guards/resource-modification.guard';
import { DoubleConfirmationGuard } from './infrastructure/guards/double-confirmation.guard';
import { ResourceAuditMiddleware } from './infrastructure/middleware/resource-audit.middleware';
import { RegisterHandler } from './application/handlers/register.handler';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';
import { PrismaPermissionRepository } from './infrastructure/repositories/prisma-permission.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';

const CommandHandlers = [LoginHandler, RegisterHandler];
const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
  imports: [
    ConfigModule,
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
  controllers: [
    AuthController,
    UserController,
    RoleController,
    PermissionController,
    // Conditionally include OAuthController only if SSO is configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [OAuthController] : []),
  ],
  providers: [
    // Services
    AuthService,
    UserService,
    RoleService,
    PermissionService,

    // Strategies
    JwtStrategy,
    LocalStrategy,
    // Conditionally include GoogleStrategy only if SSO is configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleStrategy] : []),
    SSOConfigGuard,
    ResourceModificationGuard,
    DoubleConfirmationGuard,
    ResourceAuditMiddleware,

    // Repositories
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: RoleRepository,
      useClass: PrismaRoleRepository,
    },
    {
      provide: PermissionRepository,
      useClass: PrismaPermissionRepository,
    },

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuthService, UserService, RoleService, PermissionService],
})
export class AuthModule {}
