import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateProgramCommand } from '@apps/resources-service/application/commands/create-program.command';
import { ProgramService } from '@apps/resources-service/application/services/program.service';
import { ProgramResponseDto } from '@apps/resources-service/application/dtos/program.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(CreateProgramCommand)
export class CreateProgramHandler implements ICommandHandler<CreateProgramCommand> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: CreateProgramCommand): Promise<ProgramResponseDto> {
    try {
      this.logger.log(
        'Executing create program command',
        `CreateProgramHandler - name: ${command.data.name}`,
        'CreateProgramHandler'
      );

      return await this.programService.createProgram(command.data, command.data.createdBy);
    } catch (error) {
      this.logger.error(
        `Failed to create program: ${error.message}`,
        error.stack,
        'CreateProgramHandler'
      );
      throw error;
    }
  }
}
