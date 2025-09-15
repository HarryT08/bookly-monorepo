/**
 * Send Notification Command
 */

import { ICommand } from '@nestjs/cqrs';

export class SendNotificationCommand implements ICommand {
  constructor(
    public readonly recipientId: string,
    public readonly type: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH',
    public readonly templateId: string,
    public readonly data: Record<string, unknown>,
    public readonly priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    public readonly createdBy: string,
  ) {}
}
