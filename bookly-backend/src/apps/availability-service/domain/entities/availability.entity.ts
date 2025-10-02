/**
 * Availability Entity - Domain Model (RF-07)
 * Represents basic availability hours for resources
 */
export class AvailabilityEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly dayOfWeek: number, // 0-6 (Sunday to Saturday)
    public readonly startTime: string, // HH:mm format
    public readonly endTime: string,   // HH:mm format
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateTimeFormat();
    this.validateDayOfWeek();
    this.validateTimeOrder();
  }

  private validateTimeFormat(): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.startTime)) {
      throw new Error('Invalid startTime format. Expected HH:mm');
    }
    if (!timeRegex.test(this.endTime)) {
      throw new Error('Invalid endTime format. Expected HH:mm');
    }
  }

  private validateDayOfWeek(): void {
    if (this.dayOfWeek < 0 || this.dayOfWeek > 6) {
      throw new Error('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
    }
  }

  private validateTimeOrder(): void {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes >= endMinutes) {
      throw new Error('startTime must be before endTime');
    }
  }

  /**
   * Check if a time falls within this availability window
   */
  isTimeWithinAvailability(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return false;
    }

    const [hour, minute] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + minute;

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  /**
   * Get duration in minutes
   */
  getDurationInMinutes(): number {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes - startMinutes;
  }
}
