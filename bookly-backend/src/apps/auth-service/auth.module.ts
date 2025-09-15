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
import { AuthCategoryService } from '@apps/auth-service/application/services/category.service';

// Infrastructure
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UserController } from './infrastructure/controllers/user.controller';
import { RoleController } from './infrastructure/controllers/role.controller';
import { PermissionController } from './infrastructure/controllers/permission.controller';
import { SeedController } from './infrastructure/controllers/seed.controller';
import { AuthCategoryController } from './infrastructure/controllers/category.controller';
import { OAuthController } from '@apps/auth-service/infrastructure/controllers/oauth.controller';
import { SeedService } from '@/libs/common/services/seed.service';
import { SSOConfigGuard } from './infrastructure/guards/sso-config.guard';
import { ResourceModificationGuard } from './infrastructure/guards/resource-modification.guard';
import { DoubleConfirmationGuard } from './infrastructure/guards/double-confirmation.guard';
import { ResourceAuditMiddleware } from './infrastructure/middleware/resource-audit.middleware';
import { RegisterHandler } from './application/handlers/register.handler';
import { UpdateUserHandler } from './application/handlers/update-user.handler';
import { DeleteUserHandler } from './application/handlers/delete-user.handler';
import { AssignRoleHandler } from './application/handlers/assign-role.handler';
import { RemoveRoleHandler } from './application/handlers/remove-role.handler';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';
import { PrismaPermissionRepository } from './infrastructure/repositories/prisma-permission.repository';
import { ResourcesModule } from '../resources-service/resources.module';
import { HealthModule } from '../../health/health.module';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';

const CommandHandlers = [
  LoginHandler, 
  RegisterHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  AssignRoleHandler,
  RemoveRoleHandler
];
const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    PassportModule,
    ResourcesModule,
    HealthModule,
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
    OAuthController,
    SeedController,
    AuthCategoryController,
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [OAuthController] : []),
  ],
  providers: [
    // Services
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    AuthCategoryService,
    SeedService,

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
