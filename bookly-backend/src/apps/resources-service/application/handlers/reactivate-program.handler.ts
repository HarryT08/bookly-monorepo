import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ReactivateProgramCommand } from '@apps/resources-service/application/commands/reactivate-program.command';
import { ProgramService } from '@apps/resources-service/application/services/program.service';
import { ProgramResponseDto } from '@apps/resources-service/application/dtos/program.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(ReactivateProgramCommand)
export class ReactivateProgramHandler implements ICommandHandler<ReactivateProgramCommand> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: ReactivateProgramCommand): Promise<ProgramResponseDto> {
    try {
      this.logger.log(
        'Executing reactivate program command',
        `ReactivateProgramHandler - id: ${command.id}`,
        'ReactivateProgramHandler'
      );

      return await this.programService.reactivateProgram(command.id, command.reactivatedBy);
    } catch (error) {
      this.logger.error(
        `Failed to reactivate program: ${error.message}`,
        error.stack,
        'ReactivateProgramHandler'
      );
      throw error;
    }
  }
}
