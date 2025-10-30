import { randomUUID } from 'crypto';

interface ScheduledMaintenanceProps {
  id: string;
  resourceId: string;
  type: string; // Using 'type' to match Prisma schema
  title: string;
  description: string;
  scheduledDate: Date;
  estimatedDuration: number;
  priority: string;
  status: string;
  isRecurring: boolean;
  notificationSent: boolean; // Using 'notificationSent' to match Prisma schema
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string; // Using 'assignedTo' to match Prisma schema
  estimatedCost?: number; // Using 'estimatedCost' to match Prisma schema
  instructions?: string;
  requiredTools?: string[];
  recurrenceType?: string; // Using 'recurrenceType' to match Prisma schema
  recurrenceEnd?: Date; // Using 'recurrenceEnd' to match Prisma schema
  parentScheduleId?: string;
  notifyBefore?: number;
  completionNotes?: string;
  actualCost?: number;
  actualStartDate?: Date;
  actualEndDate?: Date;
  checklist?: string[];
  requiredParts?: string[];
  safetyNotes?: string;
  specialRequirements?: string;
}

export class ScheduledMaintenanceEntity {
  constructor(private readonly props: ScheduledMaintenanceProps) {}


  static create(
    resourceId: string,
    type: string,
    title: string,
    description: string,
    scheduledDate: Date,
    estimatedDuration: number,
    priority: string,
    createdBy: string,
    status: string = 'SCHEDULED',
    isRecurring: boolean = false,
    notificationSent: boolean = false
  ): ScheduledMaintenanceEntity {
    const now = new Date();
    return new ScheduledMaintenanceEntity({
      id: randomUUID(),
      resourceId,
      type,
      title,
      description,
      scheduledDate,
      estimatedDuration,
      priority,
      status,
      isRecurring,
      notificationSent,
      createdAt: now,
      updatedAt: now,
      createdBy
    });
  }

  // Getters aligned with Prisma schema
  get id(): string { return this.props.id; }
  get resourceId(): string { return this.props.resourceId; }
  get type(): string { return this.props.type; }
  get maintenanceType(): string { return this.props.type; } // Alias for backward compatibility
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get scheduledDate(): Date { return this.props.scheduledDate; }
  get estimatedDuration(): number { return this.props.estimatedDuration; }
  get priority(): string { return this.props.priority; }
  get status(): string { return this.props.status; }
  get assignedTo(): string | undefined { return this.props.assignedTo; }
  get assignedTechnician(): string | undefined { return this.props.assignedTo; } // Alias for backward compatibility
  get estimatedCost(): number | undefined { return this.props.estimatedCost; }
  get cost(): number | undefined { return this.props.estimatedCost; } // Alias for backward compatibility
  get instructions(): string | undefined { return this.props.instructions; }
  get notes(): string | undefined { return this.props.instructions; } // Alias for backward compatibility
  get requiredTools(): string[] | undefined { return this.props.requiredTools; }
  get requirements(): string[] | undefined { return this.props.requiredTools; } // Alias for backward compatibility
  get isRecurring(): boolean { return this.props.isRecurring; }
  get recurrenceType(): string | undefined { return this.props.recurrenceType; }
  get recurringPattern(): string | undefined { return this.props.recurrenceType; } // Alias for backward compatibility
  get recurrenceEnd(): Date | undefined { return this.props.recurrenceEnd; }
  get recurringEndDate(): Date | undefined { return this.props.recurrenceEnd; } // Alias for backward compatibility
  get parentScheduleId(): string | undefined { return this.props.parentScheduleId; }
  get notificationSent(): boolean { return this.props.notificationSent; }
  get reminderSent(): boolean { return this.props.notificationSent; } // Alias for backward compatibility
  get notifyBefore(): number | undefined { return this.props.notifyBefore; }
  get completionNotes(): string | undefined { return this.props.completionNotes; }
  get actualCost(): number | undefined { return this.props.actualCost; }
  get actualStartDate(): Date | undefined { return this.props.actualStartDate; }
  get actualEndDate(): Date | undefined { return this.props.actualEndDate; }
  get checklist(): string[] | undefined { return this.props.checklist; }
  get requiredParts(): string[] | undefined { return this.props.requiredParts; }
  get safetyNotes(): string | undefined { return this.props.safetyNotes; }
  get specialRequirements(): string | undefined { return this.props.specialRequirements; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get createdBy(): string { return this.props.createdBy; }

  // Business logic methods
  updateStatus(status: string): void {
    this.props.status = status;
    this.props.updatedAt = new Date();

    if (status === 'COMPLETED') {
      this.props.actualEndDate = new Date();
    }
  }

  assignTechnician(technicianId: string): void {
    this.props.assignedTo = technicianId;
    this.props.updatedAt = new Date();
  }

  setPriority(priority: string): void {
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
      throw new Error('Invalid priority level');
    }
    
    this.props.priority = priority;
    this.props.updatedAt = new Date();
  }

  reschedule(newDate: Date): void {
    this.props.scheduledDate = newDate;
    this.props.updatedAt = new Date();
    this.props.notificationSent = false; // Reset reminder status
  }

  postpone(newDate: Date, reason: string): void {
    this.props.status = 'POSTPONED';
    this.props.scheduledDate = newDate;
    this.props.updatedAt = new Date();
  }

  cancel(reason: string): void {
    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date();
  }

  approve(): void {
    this.props.updatedAt = new Date();
  }

  markReminderSent(): void {
    this.props.notificationSent = true;
    this.props.updatedAt = new Date();
  }

  addRequirement(requirement: string): void {
    if (!this.props.requiredTools) {
      this.props.requiredTools = [];
    }
    if (!this.props.requiredTools.includes(requirement)) {
      this.props.requiredTools.push(requirement);
      this.props.updatedAt = new Date();
    }
  }

  removeRequirement(requirement: string): void {
    if (this.props.requiredTools) {
      const index = this.props.requiredTools.indexOf(requirement);
      if (index > -1) {
        this.props.requiredTools.splice(index, 1);
        this.props.updatedAt = new Date();
      }
    }
  }

  addToChecklist(item: string): void {
    if (!this.props.checklist) {
      this.props.checklist = [];
    }
    if (!this.props.checklist.includes(item)) {
      this.props.checklist.push(item);
      this.props.updatedAt = new Date();
    }
  }

  addToParts(part: string): void {
    if (!this.props.requiredParts) {
      this.props.requiredParts = [];
    }
    if (!this.props.requiredParts.includes(part)) {
      this.props.requiredParts.push(part);
      this.props.updatedAt = new Date();
    }
  }

  complete(completionNotes?: string, actualCost?: number): void {
    this.props.status = 'COMPLETED';
    this.props.actualEndDate = new Date();
    
    if (completionNotes) {
      this.props.completionNotes = completionNotes;
    }
    
    if (actualCost) {
      this.props.actualCost = actualCost;
    }
    
    this.props.updatedAt = new Date();
  }

  setInstructions(instructions: string): void {
    this.props.instructions = instructions;
    this.props.updatedAt = new Date();
  }

  // Status check methods
  isScheduled(): boolean {
    return this.props.status === 'SCHEDULED';
  }

  isInProgress(): boolean {
    return this.props.status === 'IN_PROGRESS';
  }

  isCompleted(): boolean {
    return this.props.status === 'COMPLETED';
  }

  isCancelled(): boolean {
    return this.props.status === 'CANCELLED';
  }

  isPostponed(): boolean {
    return this.props.status === 'POSTPONED';
  }

  isOverdue(): boolean {
    return new Date() > this.props.scheduledDate && !this.isCompleted() && !this.isCancelled();
  }

  isApproved(): boolean {
    return true; // Simplified for now
  }

  requiresApproval(): boolean {
    return false; // Simplified for now
  }

  isDue(hoursAhead: number = 24): boolean {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + hoursAhead);
    return this.props.scheduledDate <= dueDate && this.isScheduled();
  }

  needsReminder(hoursAhead: number = 24): boolean {
    return this.isDue(hoursAhead) && !this.props.notificationSent;
  }

  canBeExecuted(): boolean {
    return this.isScheduled() && !this.isOverdue();
  }

  // Recurring maintenance methods
  calculateNextScheduledDate(baseDate?: Date): Date {
    const currentDate = baseDate || this.props.scheduledDate;
    const nextDate = new Date(currentDate);
    
    if (!this.props.recurrenceType) {
      throw new Error('No recurring pattern defined');
    }
    
    switch (this.props.recurrenceType) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        throw new Error(`Invalid recurring pattern: ${this.props.recurrenceType}`);
    }
    
    return nextDate;
  }

  shouldGenerateNextSchedule(): boolean {
    if (!this.props.isRecurring || !this.isCompleted()) {
      return false;
    }
    
    if (this.props.recurrenceEnd) {
      const nextDate = this.calculateNextScheduledDate();
      return nextDate <= this.props.recurrenceEnd;
    }
    
    return true;
  }

  generateNextSchedule(createdBy: string): ScheduledMaintenanceEntity {
    if (!this.shouldGenerateNextSchedule()) {
      throw new Error('Cannot generate next schedule');
    }
    
    const nextDate = this.calculateNextScheduledDate();
    
    return ScheduledMaintenanceEntity.create(
      this.props.resourceId,
      this.props.type,
      this.props.title,
      this.props.description,
      nextDate,
      this.props.estimatedDuration,
      this.props.priority,
      createdBy,
      'SCHEDULED',
      true, // isRecurring
      false // notificationSent
    );
  }

  // Validation methods
  validate(): void {
    if (!this.props.resourceId) {
      throw new Error('Resource ID is required');
    }
    if (!this.props.title.trim()) {
      throw new Error('Title is required');
    }
    if (!this.props.description.trim()) {
      throw new Error('Description is required');
    }
    if (this.props.estimatedDuration <= 0) {
      throw new Error('Estimated duration must be greater than 0');
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(this.props.priority)) {
      throw new Error('Invalid priority level');
    }
    if (!['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'].includes(this.props.status)) {
      throw new Error('Invalid status');
    }
    if (!['PREVENTIVO', 'CORRECTIVO', 'EMERGENCIA', 'LIMPIEZA'].includes(this.props.type)) {
      throw new Error('Invalid maintenance type');
    }
    if (this.props.scheduledDate < new Date() && this.props.status === 'SCHEDULED') {
      throw new Error('Scheduled date cannot be in the past for new schedules');
    }
    if (this.props.isRecurring) {
      if (!this.props.recurrenceType) {
        throw new Error('Recurring pattern is required for recurring schedules');
      }
      if (!['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].includes(this.props.recurrenceType)) {
        throw new Error('Invalid recurring pattern');
      }
    }
  }
}
