/**
 * Generate Document Command
 */

import { ICommand } from '@nestjs/cqrs';

export class GenerateDocumentCommand implements ICommand {
  constructor(
    public readonly approvalId: string,
    public readonly documentType: 'APPROVAL_LETTER' | 'REJECTION_LETTER' | 'CONDITIONAL_APPROVAL',
    public readonly templateId?: string,
    public readonly customFields?: Record<string, unknown>,
  ) {}
}
