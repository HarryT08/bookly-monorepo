import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@apps/auth-service/infrastructure/decorators/roles.decorator';
import { UserService } from '@apps/auth-service/application/services/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get user with roles from database
    const userWithRoles = await this.userService.findById(user.sub || user.id);
    if (!userWithRoles) {
      return false;
    }

    // Check if user has any of the required roles
    const userRoles = userWithRoles.userRoles?.map(ur => ur.role?.name).filter(Boolean) || [];
    
    return requiredRoles.some(role => userRoles.includes(role));
  }
}
