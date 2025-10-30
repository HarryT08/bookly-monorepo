import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeactivateProgramCommand } from '@apps/resources-service/application/commands/deactivate-program.command';
import { ProgramService } from '@apps/resources-service/application/services/program.service';
import { ProgramResponseDto } from '@apps/resources-service/application/dtos/program.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(DeactivateProgramCommand)
export class DeactivateProgramHandler implements ICommandHandler<DeactivateProgramCommand> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: DeactivateProgramCommand): Promise<ProgramResponseDto> {
    try {
      this.logger.log(
        'Executing deactivate program command',
        `DeactivateProgramHandler - id: ${command.id}`,
        'DeactivateProgramHandler'
      );

      return await this.programService.deactivateProgram(command.id, command.deactivatedBy);
    } catch (error) {
      this.logger.error(
        `Failed to deactivate program: ${error.message}`,
        error.stack,
        'DeactivateProgramHandler'
      );
      throw error;
    }
  }
}
