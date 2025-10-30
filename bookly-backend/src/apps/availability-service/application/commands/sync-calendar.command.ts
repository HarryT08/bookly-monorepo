import { ICommand } from '@nestjs/cqrs';

/**
 * Command for syncing calendar events (RF-08)
 */
export class SyncCalendarCommand implements ICommand {
  constructor(
    public readonly integrationId: string
  ) {}
}
