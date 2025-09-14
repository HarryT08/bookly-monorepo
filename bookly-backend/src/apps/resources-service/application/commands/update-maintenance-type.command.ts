import { ICommand } from '@nestjs/cqrs';
import { UpdateMaintenanceTypeDto } from '@apps/resources-service/application/dtos/maintenance-type.dto';

/**
 * Update Maintenance Type Command
 * Implements RF-08 (maintenance type management)
 */
export class UpdateMaintenanceTypeCommand implements ICommand {
  constructor(
    public readonly data: UpdateMaintenanceTypeDto & { id: string; updatedBy: string }
  ) {}
}

/**
 * Deactivate Maintenance Type Command
 */
export class DeactivateMaintenanceTypeCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly deactivatedBy: string
  ) {}
}

/**
 * Reactivate Maintenance Type Command
 */
export class ReactivateMaintenanceTypeCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly reactivatedBy: string
  ) {}
}
