import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateMaintenanceTypeCommand } from '@apps/resources-service/application/commands/create-maintenance-type.command';
import { MaintenanceTypeService } from '@apps/resources-service/application/services/maintenance-type.service';
import { MaintenanceTypeResponseDto } from '@apps/resources-service/application/dtos/maintenance-type.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(CreateMaintenanceTypeCommand)
export class CreateMaintenanceTypeHandler implements ICommandHandler<CreateMaintenanceTypeCommand> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: CreateMaintenanceTypeCommand): Promise<MaintenanceTypeResponseDto> {
    try {
      this.logger.log(
        'Executing create maintenance type command',
        `CreateMaintenanceTypeHandler - name: ${command.data.name}`,
        'CreateMaintenanceTypeHandler'
      );

      return await this.maintenanceTypeService.createMaintenanceType(command.data);
    } catch (error) {
      this.logger.error(
        `Failed to create maintenance type: ${error.message}`,
        error.stack,
        'CreateMaintenanceTypeHandler'
      );
      throw error;
    }
  }
}
