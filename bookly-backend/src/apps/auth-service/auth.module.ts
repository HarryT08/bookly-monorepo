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
import { AuthRoleCategoryService } from './application/services/auth-role-category.service';
import { RoleCategoryService } from './application/services/role-category.service';
import { AuthUserCategoryService } from './application/services/auth-user-category.service';

// Infrastructure
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UserController } from './infrastructure/controllers/user.controller';
import { RoleController } from './infrastructure/controllers/role.controller';
import { PermissionController } from './infrastructure/controllers/permission.controller';
import { SeedController } from './infrastructure/controllers/seed.controller';
import { RoleCategoryController } from './infrastructure/controllers/role-category.controller';
import { UserCategoryController } from './infrastructure/controllers/user-category.controller';
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

// Category Handlers
import { CreateCategoryHandler } from './application/handlers/category/create-role-category.handler';
import { UpdateCategoryHandler } from './application/handlers/category/update-role-category.handler';
import { DeleteCategoryHandler } from './application/handlers/category/delete-role-category.handler';
import { FindAllCategoriesHandler } from './application/handlers/category/find-role-categories.handler';
import { FindCategoryByIdHandler } from './application/handlers/category/find-role-category-by-id.handler';
import { FindDefaultCategoriesHandler } from './application/handlers/category/find-default-role-categories.handler';

// Role-Category Handlers
import { AssignCategoriesToRoleHandler } from './application/handlers/role-category/assign-categories-to-role.handler';
import { RemoveCategoriesFromRoleHandler } from './application/handlers/role-category/remove-categories-from-role.handler';
import { GetRoleCategoriesHandler } from './application/handlers/role-category/get-role-categories.handler';

// User Category imports
import { AssignCategoriesToUserCommand } from './application/commands/user-category/assign-categories-to-user.command';
import { RemoveCategoriesFromUserCommand } from './application/commands/user-category/remove-categories-from-user.command';
import { AssignCategoriesToUserHandler } from './application/handlers/user-category/assign-categories-to-user.handler';
import { RemoveCategoriesFromUserHandler } from './application/handlers/user-category/remove-categories-from-user.handler';
import { GetUserCategoriesHandler } from './application/handlers/user-category/get-user-categories.handler';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';
import { PrismaPermissionRepository } from './infrastructure/repositories/prisma-permission.repository';
import { ResourcesModule } from '../resources-service/resources.module';
import { HealthModule } from '../../health/health.module';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { RoleCategoryRepository } from '@libs/common/repositories/role-category.repository';
import { UserCategoryRepository } from '@libs/common/repositories/user-category.repository';
import { PrismaCategoryRepository } from '../resources-service/infrastructure/repositories/prisma-category.repository';

const CommandHandlers = [
  LoginHandler, 
  RegisterHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  AssignRoleHandler,
  RemoveRoleHandler,
  // Category Command Handlers
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
  // Role-Category Command Handlers
  AssignCategoriesToRoleHandler,
  RemoveCategoriesFromRoleHandler,
  // User-Category Command Handlers
  AssignCategoriesToUserHandler,
  RemoveCategoriesFromUserHandler,
];

const QueryHandlers = [
  GetUserHandler, 
  GetUsersHandler,
  // Category Query Handlers
  FindAllCategoriesHandler,
  FindCategoryByIdHandler,
  FindDefaultCategoriesHandler,
  // Role-Category Query Handler
  GetRoleCategoriesHandler,
  // User-Category Query Handler
  GetUserCategoriesHandler,
];

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
    RoleCategoryController,
    UserCategoryController,
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [OAuthController] : []),
  ],
  providers: [
    // Services
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    AuthRoleCategoryService,
    AuthUserCategoryService,
    RoleCategoryService,
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
    {
      provide: 'CategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    RoleCategoryRepository,
    UserCategoryRepository,

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuthService, UserService, RoleService, PermissionService],
})
export class AuthModule {}
