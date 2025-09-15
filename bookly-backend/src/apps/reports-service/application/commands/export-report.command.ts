/**
 * Export Report Command
 */

import { ICommand } from '@nestjs/cqrs';

export class ExportReportCommand implements ICommand {
  constructor(
    public readonly reportType: string,
    public readonly format: 'CSV' | 'PDF' | 'EXCEL',
    public readonly exportedBy: string,
    public readonly filters?: Record<string, unknown>,
  ) {}
}
