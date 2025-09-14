import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateProgramCommand } from '@apps/resources-service/application/commands/update-program.command';
import { ProgramService } from '@apps/resources-service/application/services/program.service';
import { ProgramResponseDto } from '@apps/resources-service/application/dtos/program.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(UpdateProgramCommand)
export class UpdateProgramHandler implements ICommandHandler<UpdateProgramCommand> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: UpdateProgramCommand): Promise<ProgramResponseDto> {
    try {
      this.logger.log(
        'Executing update program command',
        `UpdateProgramHandler - id: ${command.data.id}`,
        'UpdateProgramHandler'
      );

      return await this.programService.updateProgram(command.data.id, command.data, command.data.updatedBy);
    } catch (error) {
      this.logger.error(
        `Failed to update program: ${error.message}`,
        error.stack,
        'UpdateProgramHandler'
      );
      throw error;
    }
  }
}
