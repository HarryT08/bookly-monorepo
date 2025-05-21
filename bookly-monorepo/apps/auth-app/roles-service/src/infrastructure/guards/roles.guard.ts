import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);
      
      // Si no hay roles requeridos, permitimos el acceso
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
      
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      // Si no hay usuario o no tiene roles, no permitimos el acceso
      if (!user?.roles || !Array.isArray(user.roles)) {
        console.log('RolesGuard: No user or invalid roles', { user });
        return false;
      }
      
      // Verificamos si el usuario tiene alguno de los roles requeridos
      return requiredRoles.some((role) => user.roles.includes(role));
    } catch (error) {
      console.error('Error en RolesGuard:', error);
      return false;
    }
  }
}
