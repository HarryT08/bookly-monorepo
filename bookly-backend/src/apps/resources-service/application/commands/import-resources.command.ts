import { ICommand } from '@nestjs/cqrs';
import { Multer } from 'multer';

/**
 * Import Resources Command
 * Implements RF-04 (bulk resource import)
 */
export class ImportResourcesCommand implements ICommand {
  constructor(
    public readonly file: Multer.File,
    public readonly importedBy: string
  ) {}
}

/**
 * Preview Import Command
 * Validates and previews CSV before import
 */
export class PreviewImportCommand implements ICommand {
  constructor(
    public readonly file: Multer.File,
    public readonly userId: string
  ) {}
}

/**
 * Start Import Command
 * Starts the actual import process
 */
export class StartImportCommand implements ICommand {
  constructor(
    public readonly file: Multer.File,
    public readonly userId: string
  ) {}
}

/**
 * Validate Import File Command
 */
export class ValidateImportFileCommand implements ICommand {
  constructor(
    public readonly file: Multer.File
  ) {}
}
