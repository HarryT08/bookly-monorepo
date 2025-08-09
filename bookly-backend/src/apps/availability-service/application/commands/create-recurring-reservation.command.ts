/**
 * Command for creating recurring reservations (RF-12)
 * CQRS Command Pattern Implementation
 */

import { ICommand } from '@nestjs/cqrs';
import { RecurrenceFrequency } from '../../utils';

export class CreateRecurringReservationCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly frequency: RecurrenceFrequency,
    public readonly interval: number = 1,
    public readonly daysOfWeek?: number[],
    public readonly dayOfMonth?: number,
    public readonly description?: string,
    public readonly programId?: string,
    public readonly maxInstances: number = 20,
    public readonly autoConfirm: boolean = false,
    public readonly sendNotifications: boolean = true,
    public readonly notes?: string,
    public readonly tags?: string[],
    public readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
    public readonly allowOverlap: boolean = false,
    public readonly requireConfirmation: boolean = true,
    public readonly reminderHours?: number,
    public readonly customRule?: string,
    public readonly createdBy?: string
  ) {}
}

export class UpdateRecurringReservationCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly updateData: {
      title?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      startTime?: string;
      endTime?: string;
      frequency?: RecurrenceFrequency;
      interval?: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      programId?: string;
      maxInstances?: number;
      autoConfirm?: boolean;
      sendNotifications?: boolean;
      notes?: string;
      tags?: string[];
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      allowOverlap?: boolean;
      requireConfirmation?: boolean;
      reminderHours?: number;
      customRule?: string;
    },
    public readonly updateScope: 'FUTURE_ONLY' | 'ALL_INSTANCES' | 'CONFIGURATION_ONLY' = 'FUTURE_ONLY',
    public readonly updateReason?: string,
    public readonly notifyUsers: boolean = true,
    public readonly regenerateInstances: boolean = true,
    public readonly updatedBy?: string
  ) {}
}

export class CancelRecurringReservationCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly cancelScope: 'FUTURE_ONLY' | 'ALL_INSTANCES' = 'FUTURE_ONLY',
    public readonly notifyUsers: boolean = true,
    public readonly cancelledBy?: string
  ) {}
}

export class CancelRecurringReservationInstanceCommand implements ICommand {
  constructor(
    public readonly recurringReservationId: string,
    public readonly instanceId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly notifyUsers: boolean = true,
    public readonly cancelledBy?: string
  ) {}
}

export class GenerateRecurringReservationInstancesCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly generateUntil: Date,
    public readonly userId: string,
    public readonly maxInstances?: number,
    public readonly skipConflicts: boolean = true,
    public readonly generatedBy?: string
  ) {}
}

export class ConfirmRecurringReservationInstanceCommand implements ICommand {
  constructor(
    public readonly recurringReservationId: string,
    public readonly instanceId: string,
    public readonly userId: string,
    public readonly confirmedBy: string,
    public readonly notes?: string
  ) {}
}

export class ValidateRecurringReservationCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly frequency: RecurrenceFrequency,
    public readonly interval: number = 1,
    public readonly daysOfWeek?: number[],
    public readonly dayOfMonth?: number,
    public readonly maxInstances: number = 20,
    public readonly allowOverlap: boolean = false,
    public readonly programId?: string
  ) {}
}

export class BulkCancelRecurringReservationsCommand implements ICommand {
  constructor(
    public readonly reservationIds: string[],
    public readonly reason: string,
    public readonly userId: string,
    public readonly cancelScope: 'FUTURE_ONLY' | 'ALL_INSTANCES' = 'FUTURE_ONLY',
    public readonly notifyUsers: boolean = true,
    public readonly cancelledBy: string
  ) {}
}
