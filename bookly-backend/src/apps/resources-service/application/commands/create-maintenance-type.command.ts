import { ICommand } from '@nestjs/cqrs';
import { CreateMaintenanceTypeDto } from '@apps/resources-service/application/dtos/maintenance-type.dto';

/**
 * Create Maintenance Type Command
 * Implements RF-08 (maintenance type management)
 */
export class CreateMaintenanceTypeCommand implements ICommand {
  constructor(
    public readonly data: CreateMaintenanceTypeDto & { createdBy: string }
  ) {}
}
