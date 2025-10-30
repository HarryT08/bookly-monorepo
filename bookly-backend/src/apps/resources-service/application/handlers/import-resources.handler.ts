import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ImportResourcesCommand, PreviewImportCommand, StartImportCommand, ValidateImportFileCommand } from '@apps/resources-service/application/commands/import-resources.command';
import { ResourceImportService } from '@apps/resources-service/application/services/resource-import.service';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(ImportResourcesCommand)
export class ImportResourcesHandler implements ICommandHandler<ImportResourcesCommand> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: ImportResourcesCommand): Promise<any> {
    try {
      this.logger.log(
        'Executing import resources command',
        `ImportResourcesHandler - file: ${command.file.originalname}`,
        'ImportResourcesHandler'
      );

      return await this.resourceImportService.startImport(command.file, command.importedBy);
    } catch (error) {
      this.logger.error(
        `Failed to import resources: ${error.message}`,
        error.stack,
        'ImportResourcesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ValidateImportFileCommand)
export class ValidateImportFileHandler implements ICommandHandler<ValidateImportFileCommand> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: ValidateImportFileCommand): Promise<any> {
    try {
      this.logger.log(
        'Executing validate import file command',
        `ValidateImportFileHandler - file: ${command.file.originalname}`,
        'ValidateImportFileHandler'
      );

      return await this.resourceImportService.previewImport(command.file, 'system');
    } catch (error) {
      this.logger.error(
        `Failed to validate import file: ${error.message}`,
        error.stack,
        'ValidateImportFileHandler'
      );
      throw error;
    }
  }
}
