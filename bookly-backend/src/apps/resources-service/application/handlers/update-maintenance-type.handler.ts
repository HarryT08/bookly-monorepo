import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateMaintenanceTypeCommand, DeactivateMaintenanceTypeCommand, ReactivateMaintenanceTypeCommand } from '@apps/resources-service/application/commands/update-maintenance-type.command';
import { MaintenanceTypeService } from '@apps/resources-service/application/services/maintenance-type.service';
import { MaintenanceTypeResponseDto } from '@apps/resources-service/application/dtos/maintenance-type.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(UpdateMaintenanceTypeCommand)
export class UpdateMaintenanceTypeHandler implements ICommandHandler<UpdateMaintenanceTypeCommand> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: UpdateMaintenanceTypeCommand): Promise<MaintenanceTypeResponseDto> {
    try {
      this.logger.log(
        'Executing update maintenance type command',
        `UpdateMaintenanceTypeHandler - id: ${command.data.id}`,
        'UpdateMaintenanceTypeHandler'
      );

     const result = await this.maintenanceTypeService.updateMaintenanceType(command.data.id, command.data);
     return result;
    } catch (error) {
      this.logger.error(
        `Failed to update maintenance type: ${error.message}`,
        error.stack,
        'UpdateMaintenanceTypeHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(DeactivateMaintenanceTypeCommand)
export class DeactivateMaintenanceTypeHandler implements ICommandHandler<DeactivateMaintenanceTypeCommand> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: DeactivateMaintenanceTypeCommand): Promise<void> {
    try {
      this.logger.log(
        'Executing deactivate maintenance type command',
        `DeactivateMaintenanceTypeHandler - id: ${command.id}`,
        'DeactivateMaintenanceTypeHandler'
      );

      await this.maintenanceTypeService.deactivateMaintenanceType(command.id);
    } catch (error) {
      this.logger.error(
        `Failed to deactivate maintenance type: ${error.message}`,
        error.stack,
        'DeactivateMaintenanceTypeHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ReactivateMaintenanceTypeCommand)
export class ReactivateMaintenanceTypeHandler implements ICommandHandler<ReactivateMaintenanceTypeCommand> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: ReactivateMaintenanceTypeCommand): Promise<MaintenanceTypeResponseDto> {
    try {
      this.logger.log(
        'Executing reactivate maintenance type command',
        `ReactivateMaintenanceTypeHandler - id: ${command.id}`,
        'ReactivateMaintenanceTypeHandler'
      );

     const result = await this.maintenanceTypeService.reactivateMaintenanceType(command.id);
     return result;
    } catch (error) {
      this.logger.error(
        `Failed to reactivate maintenance type: ${error.message}`,
        error.stack,
        'ReactivateMaintenanceTypeHandler'
      );
      throw error;
    }
  }
}
