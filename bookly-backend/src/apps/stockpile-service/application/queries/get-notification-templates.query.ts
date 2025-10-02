/**
 * Get Notification Templates Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetNotificationTemplatesQuery implements IQuery {
  constructor(
    public readonly type?: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH',
    public readonly category?: string,
    public readonly isActive?: boolean,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
