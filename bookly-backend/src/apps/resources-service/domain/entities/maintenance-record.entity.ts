import { randomUUID } from 'crypto';

export class MaintenanceRecordEntity {
  constructor(
    private readonly _id: string,
    private readonly _resourceId: string,
    private readonly _userId: string,
    private readonly _maintenanceType: string,
    private readonly _title: string,
    private readonly _description: string,
    private readonly _priority: string,
    private _status: string,
    private readonly _scheduledDate: Date,
    private readonly _estimatedDuration: number,
    private readonly _isRecurring: boolean,
    private _completionPercentage: number,
    private _followUpRequired: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _createdBy: string,
    private _startDate?: Date,
    private _endDate?: Date,
    private _actualDuration?: number,
    private _cost?: number,
    private _notes?: string,
    private _attachments?: string[],
    private _assignedTechnician?: string,
    private _technicianNotes?: string,
    private readonly _recurringPattern?: string,
    private _nextScheduledDate?: Date,
    private readonly _parentRecordId?: string,
    private _qualityRating?: number,
    private _followUpDate?: Date,
    private _updatedBy?: string,
  ) {}

  static create(
    resourceId: string,
    userId: string,
    maintenanceType: string,
    title: string,
    description: string,
    priority: string,
    scheduledDate: Date,
    estimatedDuration: number,
    createdBy: string,
    status: string = 'PENDING',
    isRecurring: boolean = false,
    completionPercentage: number = 0,
    followUpRequired: boolean = false,
  ): MaintenanceRecordEntity {
    const now = new Date();
    return new MaintenanceRecordEntity(
      randomUUID(),
      resourceId,
      userId,
      maintenanceType,
      title,
      description,
      priority,
      status,
      scheduledDate,
      estimatedDuration,
      isRecurring,
      completionPercentage,
      followUpRequired,
      now, // createdAt
      now, // updatedAt
      createdBy,
    );
  }

  // Getters
  get id(): string { return this._id; }
  get resourceId(): string { return this._resourceId; }
  get userId(): string { return this._userId; }
  get maintenanceType(): string { return this._maintenanceType; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get priority(): string { return this._priority; }
  get status(): string { return this._status; }
  get scheduledDate(): Date { return this._scheduledDate; }
  get startDate(): Date | undefined { return this._startDate; }
  get endDate(): Date | undefined { return this._endDate; }
  get actualDuration(): number | undefined { return this._actualDuration; }
  get estimatedDuration(): number { return this._estimatedDuration; }
  get cost(): number | undefined { return this._cost; }
  get notes(): string | undefined { return this._notes; }
  get attachments(): string[] | undefined { return this._attachments; }
  get assignedTechnician(): string | undefined { return this._assignedTechnician; }
  get technicianNotes(): string | undefined { return this._technicianNotes; }
  get isRecurring(): boolean { return this._isRecurring; }
  get recurringPattern(): string | undefined { return this._recurringPattern; }
  get nextScheduledDate(): Date | undefined { return this._nextScheduledDate; }
  get parentRecordId(): string | undefined { return this._parentRecordId; }
  get completionPercentage(): number { return this._completionPercentage; }
  get qualityRating(): number | undefined { return this._qualityRating; }
  get followUpRequired(): boolean { return this._followUpRequired; }
  get followUpDate(): Date | undefined { return this._followUpDate; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get createdBy(): string { return this._createdBy; }
  get updatedBy(): string | undefined { return this._updatedBy; }

  // Business logic methods
  updateStatus(status: string, updatedBy: string): void {
    this._status = status;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();

    if (status === 'IN_PROGRESS' && !this._startDate) {
      this._startDate = new Date();
    }

    if (status === 'COMPLETED' && !this._endDate) {
      this._endDate = new Date();
      this._completionPercentage = 100;
      this.calculateActualDuration();
    }
  }

  updateProgress(percentage: number, updatedBy: string): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Completion percentage must be between 0 and 100');
    }
    
    this._completionPercentage = percentage;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();

    if (percentage === 100 && this._status !== 'COMPLETED') {
      this.updateStatus('COMPLETED', updatedBy);
    }
  }

  assignTechnician(technicianId: string, updatedBy: string): void {
    this._assignedTechnician = technicianId;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  addTechnicianNotes(notes: string, updatedBy: string): void {
    this._technicianNotes = notes;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  addAttachment(attachmentUrl: string, updatedBy: string): void {
    if (!this._attachments) {
      this._attachments = [];
    }
    this._attachments.push(attachmentUrl);
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  scheduleFollowUp(followUpDate: Date, updatedBy: string): void {
    this._followUpRequired = true;
    this._followUpDate = followUpDate;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  completeFollowUp(updatedBy: string): void {
    this._followUpRequired = false;
    this._followUpDate = undefined;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  setQualityRating(rating: number, updatedBy: string): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Quality rating must be between 1 and 5');
    }
    
    this._qualityRating = rating;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  reschedule(newScheduledDate: Date, updatedBy: string): void {
    // ScheduledDate is readonly in new structure, would need to create new instance
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();

    // Update next scheduled date for recurring maintenance
    if (this._isRecurring && this._recurringPattern) {
      this._nextScheduledDate = this.calculateNextScheduledDate(newScheduledDate);
    }
  }

  private calculateActualDuration(): void {
    if (this._startDate && this._endDate) {
      const durationMs = this._endDate.getTime() - this._startDate.getTime();
      this._actualDuration = Math.round(durationMs / (1000 * 60)); // minutes
    }
  }

  private calculateNextScheduledDate(baseDate: Date): Date {
    const nextDate = new Date(baseDate);
    
    switch (this._recurringPattern) {
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
        throw new Error(`Invalid recurring pattern: ${this._recurringPattern}`);
    }
    
    return nextDate;
  }

  isOverdue(): boolean {
    return new Date() > this._scheduledDate && this._status !== 'COMPLETED';
  }

  isPending(): boolean {
    return this._status === 'PENDING';
  }

  isInProgress(): boolean {
    return this._status === 'IN_PROGRESS';
  }

  isCompleted(): boolean {
    return this._status === 'COMPLETED';
  }

  isCancelled(): boolean {
    return this._status === 'CANCELLED';
  }

  requiresFollowUp(): boolean {
    return this._followUpRequired && this._followUpDate !== undefined;
  }

  // Validation methods
  validate(): void {
    if (!this._resourceId) {
      throw new Error('Resource ID is required');
    }
    if (!this._userId) {
      throw new Error('User ID is required');
    }
    if (!this._title.trim()) {
      throw new Error('Title is required');
    }
    if (!this._description.trim()) {
      throw new Error('Description is required');
    }
    if (this._estimatedDuration <= 0) {
      throw new Error('Estimated duration must be greater than 0');
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(this._priority)) {
      throw new Error('Invalid priority level');
    }
    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(this._status)) {
      throw new Error('Invalid status');
    }
    if (!['PREVENTIVO', 'CORRECTIVO', 'EMERGENCIA', 'LIMPIEZA'].includes(this._maintenanceType)) {
      throw new Error('Invalid maintenance type');
    }
  }
}
