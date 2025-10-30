import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '@apps/auth-service/application/services/user.service';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';

/**
 * Guard para RF-42: Restricción de modificación de recursos
 * Solo administradores pueden modificar recursos (salas, equipos, etc.)
 * Audita todos los intentos de modificación no autorizados
 */
@Injectable()
export class ResourceModificationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const ipAddress = request.ip || request.connection.remoteAddress;

    // Solo aplicar restricciones a operaciones de modificación
    const isModificationOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    if (!isModificationOperation) {
      return true; // Permitir operaciones de lectura
    }

    // Verificar si el usuario está autenticado
    if (!user || !user.id) {
      this.loggingService.warn(
        'Unauthorized resource modification attempt - No authenticated user',
        LoggingHelper.logAuthInfo('unknown', ipAddress, 'local'),
      );
      throw new ForbiddenException('Authentication required for resource modification');
    }

    try {
      // Get user with roles
      const userWithRoles = await this.userService.findByIdWithRoles(user.id);
      
      if (!userWithRoles || !userWithRoles.userRoles) {
        this.loggingService.warn(
          'Resource modification denied - User has no roles assigned',
          LoggingHelper.logUserInfo(user.id, user.email, ipAddress),
        );
        throw new ForbiddenException('No roles assigned to user');
      }

      // Verificar si el usuario tiene rol de administrador
      const hasAdminRole = userWithRoles.userRoles.some(userRole => {
        const roleName = userRole.role?.name;
        return roleName === 'Administrador General' || roleName === 'Administrador de Programa';
      });

      if (!hasAdminRole) {
        // Auditar intento de modificación no autorizado
        this.loggingService.warn(
          'Resource modification denied - Insufficient permissions',
          LoggingHelper.logParams({
            userId: user.id,
            email: user.email,
            ipAddress,
            method,
            url,
            userRoles: userWithRoles.userRoles.map(ur => ur.role?.name).filter(Boolean),
            reason: 'User does not have administrator role',
          }),
        );

        throw new ForbiddenException(
          'Only administrators can modify resources. This incident has been logged.',
        );
      }

      // Auditar modificación autorizada
      this.loggingService.log(
        'Resource modification authorized',
        LoggingHelper.logParams({
          userId: user.id,
          email: user.email,
          ipAddress,
          method,
          url,
          adminRole: userWithRoles.userRoles.find(ur => 
            ur.role?.name === 'Administrador General' || ur.role?.name === 'Administrador de Programa'
          )?.role?.name,
        }),
      );

      return true;

    } catch (error) {
      // Auditar error en verificación
      this.loggingService.error(
        'Error during resource modification authorization check',
        LoggingHelper.logError(error, {
          userId: user.id,
          email: user.email,
          ipAddress,
          method,
          url,
        }),
      );

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ForbiddenException('Authorization check failed');
    }
  }
}
