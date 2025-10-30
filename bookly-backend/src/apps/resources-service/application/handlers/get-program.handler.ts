import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetProgramQuery, 
  GetProgramByCodeQuery, 
  GetProgramsQuery, 
  GetActiveProgramsQuery 
} from '@apps/resources-service/application/queries/get-program.query';
import { ProgramService } from '@apps/resources-service/application/services/program.service';
import { ProgramResponseDto } from '@apps/resources-service/application/dtos/program.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@QueryHandler(GetProgramQuery)
export class GetProgramHandler implements IQueryHandler<GetProgramQuery> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetProgramQuery): Promise<ProgramResponseDto> {
    try {
      this.logger.log(
        'Executing get program query',
        `GetProgramHandler - id: ${query.id}`,
        'GetProgramHandler'
      );

      return await this.programService.getProgramById(query.id);
    } catch (error) {
      this.logger.error(
        `Failed to get program: ${error.message}`,
        error.stack,
        'GetProgramHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetProgramByCodeQuery)
export class GetProgramByCodeHandler implements IQueryHandler<GetProgramByCodeQuery> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetProgramByCodeQuery): Promise<ProgramResponseDto> {
    try {
      this.logger.log(
        'Executing get program by code query',
        `GetProgramByCodeHandler - code: ${query.code}`,
        'GetProgramByCodeHandler'
      );

      return await this.programService.getProgramByCode(query.code);
    } catch (error) {
      this.logger.error(
        `Failed to get program by code: ${error.message}`,
        error.stack,
        'GetProgramByCodeHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetProgramsQuery)
export class GetProgramsHandler implements IQueryHandler<GetProgramsQuery> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetProgramsQuery): Promise<{ programs: ProgramResponseDto[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(
        'Executing get programs query',
        `GetProgramsHandler - page: ${query.page}, limit: ${query.limit}`,
        'GetProgramsHandler'
      );

      return await this.programService.getPrograms(query.page, query.limit, query.search, query.isActive);
    } catch (error) {
      this.logger.error(
        `Failed to get programs: ${error.message}`,
        error.stack,
        'GetProgramsHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetActiveProgramsQuery)
export class GetActiveProgramsHandler implements IQueryHandler<GetActiveProgramsQuery> {
  constructor(
    private readonly programService: ProgramService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetActiveProgramsQuery): Promise<ProgramResponseDto[]> {
    try {
      this.logger.log(
        'Executing get active programs query',
        'GetActiveProgramsHandler',
        'GetActiveProgramsHandler'
      );

      return await this.programService.getActivePrograms();
    } catch (error) {
      this.logger.error(
        `Failed to get active programs: ${error.message}`,
        error.stack,
        'GetActiveProgramsHandler'
      );
      throw error;
    }
  }
}
