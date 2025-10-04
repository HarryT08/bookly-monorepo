import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

// Domain
import { PermissionRepository } from "@apps/auth-service/domain/repositories/permission.repository";
import { RoleRepository } from "@apps/auth-service/domain/repositories/role.repository";
import { UserRepository } from "@apps/auth-service/domain/repositories/user.repository";

// Application
import { GetUserHandler } from "@/apps/auth-service/application/handlers/get-user.handler";
import { GetUsersHandler } from "@/apps/auth-service/application/handlers/get-users.handler";
import { LoginHandler } from "@/apps/auth-service/application/handlers/login.handler";
import { AuthService } from "@apps/auth-service/application/services/auth.service";
import { PermissionService } from "@apps/auth-service/application/services/permission.service";
import { RoleService } from "@apps/auth-service/application/services/role.service";
import { UserService } from "@apps/auth-service/application/services/user.service";
import { AuthRoleCategoryService } from "./application/services/auth-role-category.service";
import { AuthUserCategoryService } from "./application/services/auth-user-category.service";
import { RoleCategoryService } from "./application/services/role-category.service";

// Infrastructure
import { SeedService } from "@/libs/common/services/seed.service";
import { OAuthController } from "@apps/auth-service/infrastructure/controllers/oauth.controller";
import { AssignRoleHandler } from "./application/handlers/assign-role.handler";
import { DeleteUserHandler } from "./application/handlers/delete-user.handler";
import { RegisterHandler } from "./application/handlers/register.handler";
import { RemoveRoleHandler } from "./application/handlers/remove-role.handler";
import { UpdateUserHandler } from "./application/handlers/update-user.handler";
import { AuthController } from "./infrastructure/controllers/auth.controller";
import { PermissionController } from "./infrastructure/controllers/permission.controller";
import { RoleCategoryController } from "./infrastructure/controllers/role-category.controller";
import { RoleController } from "./infrastructure/controllers/role.controller";
import { SeedController } from "./infrastructure/controllers/seed.controller";
import { UserCategoryController } from "./infrastructure/controllers/user-category.controller";
import { UserController } from "./infrastructure/controllers/user.controller";
import { DoubleConfirmationGuard } from "./infrastructure/guards/double-confirmation.guard";
import { ResourceModificationGuard } from "./infrastructure/guards/resource-modification.guard";
import { SSOConfigGuard } from "./infrastructure/guards/sso-config.guard";
import { ResourceAuditMiddleware } from "./infrastructure/middleware/resource-audit.middleware";

// Category Handlers
import { CreateCategoryHandler } from "./application/handlers/category/create-role-category.handler";
import { DeleteCategoryHandler } from "./application/handlers/category/delete-role-category.handler";
import { FindDefaultCategoriesHandler } from "./application/handlers/category/find-default-role-categories.handler";
import { FindAllCategoriesHandler } from "./application/handlers/category/find-role-categories.handler";
import { FindCategoryByIdHandler } from "./application/handlers/category/find-role-category-by-id.handler";
import { UpdateCategoryHandler } from "./application/handlers/category/update-role-category.handler";

// Role-Category Handlers
import { AssignCategoriesToRoleHandler } from "./application/handlers/role-category/assign-categories-to-role.handler";
import { GetRoleCategoriesHandler } from "./application/handlers/role-category/get-role-categories.handler";
import { RemoveCategoriesFromRoleHandler } from "./application/handlers/role-category/remove-categories-from-role.handler";

// User Category imports
import { RoleCategoryRepository } from "@libs/common/repositories/role-category.repository";
import { UserCategoryRepository } from "@libs/common/repositories/user-category.repository";
import { HealthModule } from "../../health/health.module";
import { AssignCategoriesToUserHandler } from "./application/handlers/user-category/assign-categories-to-user.handler";
import { GetUserCategoriesHandler } from "./application/handlers/user-category/get-user-categories.handler";
import { RemoveCategoriesFromUserHandler } from "./application/handlers/user-category/remove-categories-from-user.handler";
import { CategoryUserGroupRepository } from "./infrastructure/repositories/prisma-category-user-group.repository";
import { PrismaPermissionRepository } from "./infrastructure/repositories/prisma-permission.repository";
import { PrismaRoleRepository } from "./infrastructure/repositories/prisma-role.repository";
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { GoogleStrategy } from "./infrastructure/strategies/google.strategy";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { LocalStrategy } from "./infrastructure/strategies/local.strategy";

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
    HealthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN"),
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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [OAuthController]
      : []),
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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleStrategy]
      : []),
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
      provide: "CategoryRepository",
      useClass: CategoryUserGroupRepository,
    },
    RoleCategoryRepository,
    UserCategoryRepository,

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    // Export authentication modules so other services can use them
    JwtModule,
    PassportModule,
    JwtStrategy,
  ],
})
export class AuthModule {}
