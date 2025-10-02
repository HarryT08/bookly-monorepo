import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESOURCE_ADMIN_KEY } from '@apps/auth-service/infrastructure/decorators/resource-admin.decorator';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';

/**
 * Guard para RF-42: Validación de doble confirmación para eliminaciones
 * Requiere que las operaciones de eliminación incluyan confirmación explícita
 */
@Injectable()
export class DoubleConfirmationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private loggingService: LoggingService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const resourceAdminMetadata = this.reflector.getAllAndOverride(RESOURCE_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Solo aplicar si el endpoint requiere doble confirmación
    if (!resourceAdminMetadata?.requiresDoubleConfirmation) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;
    const ipAddress = request.ip || request.connection.remoteAddress;

    // Solo aplicar a operaciones DELETE
    if (method !== 'DELETE') {
      return true;
    }

    // Verificar que existe el campo de confirmación
    const confirmationField = request.body?.confirmation || request.query?.confirmation;
    const resourceId = request.params?.id;

    if (!confirmationField) {
      this.loggingService.log(
        'Double confirmation required for resource deletion',
        LoggingHelper.logParams({
          userId: user?.id,
          email: user?.email,
          ipAddress,
          resourceType: resourceAdminMetadata.resourceType,
          resourceId,
          reason: 'Missing confirmation field',
        }),
      );

      throw new BadRequestException(
        `Double confirmation required. Please include 'confirmation' field with value 'DELETE' to confirm deletion of ${resourceAdminMetadata.resourceType}.`,
      );
    }

    // Verificar que la confirmación sea exactamente 'DELETE'
    if (confirmationField !== 'DELETE') {
      this.loggingService.warn(
        'Invalid confirmation value for resource deletion',
        LoggingHelper.logParams({
          userId: user?.id,
          email: user?.email,
          ipAddress,
          resourceType: resourceAdminMetadata.resourceType,
          resourceId,
          providedConfirmation: confirmationField,
          reason: 'Invalid confirmation value',
        }),
      );

      throw new BadRequestException(
        `Invalid confirmation. Please provide 'confirmation' field with exact value 'DELETE' to confirm deletion.`,
      );
    }

    // Auditar confirmación exitosa
    this.loggingService.log(
      'Double confirmation validated for resource deletion',
      LoggingHelper.logParams({
        userId: user?.id,
        email: user?.email,
        ipAddress,
        resourceType: resourceAdminMetadata.resourceType,
        resourceId,
        confirmation: 'validated',
      }),
    );

    return true;
  }
}
