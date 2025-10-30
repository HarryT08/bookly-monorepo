/**
 * Calendar Integration Entity - Domain Model (RF-08)
 * Represents external calendar integration configuration
 */
export class CalendarIntegrationEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string | null,
    public readonly provider: CalendarProvider,
    public readonly name: string,
    public readonly credentials: any,
    public readonly calendarId: string | null,
    public readonly syncInterval: number,
    public readonly lastSync: Date | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateSyncInterval();
    this.validateCredentials();
  }

  private validateSyncInterval(): void {
    if (this.syncInterval < 5) {
      throw new Error('Sync interval must be at least 5 minutes');
    }
    if (this.syncInterval > 1440) { // 24 hours
      throw new Error('Sync interval cannot exceed 24 hours');
    }
  }

  private validateCredentials(): void {
    if (!this.credentials || typeof this.credentials !== 'object') {
      throw new Error('Credentials must be a valid object');
    }

    switch (this.provider) {
      case CalendarProvider.GOOGLE:
        if (!this.credentials.clientId || !this.credentials.clientSecret) {
          throw new Error('Google Calendar requires clientId and clientSecret');
        }
        break;
      case CalendarProvider.OUTLOOK:
        if (!this.credentials.clientId || !this.credentials.clientSecret) {
          throw new Error('Outlook Calendar requires clientId and clientSecret');
        }
        break;
      case CalendarProvider.ICAL:
        if (!this.credentials.url) {
          throw new Error('iCal integration requires URL');
        }
        break;
    }
  }

  /**
   * Check if sync is due based on interval
   */
  isSyncDue(): boolean {
    if (!this.isActive) return false;
    if (!this.lastSync) return true;

    const now = new Date();
    const nextSyncTime = new Date(this.lastSync.getTime() + this.syncInterval * 60 * 1000);
    return now >= nextSyncTime;
  }

  /**
   * Check if integration is properly configured
   */
  isConfigured(): boolean {
    try {
      this.validateCredentials();
      return this.isActive;
    } catch {
      return false;
    }
  }

  /**
   * Get next sync time
   */
  getNextSyncTime(): Date | null {
    if (!this.lastSync) return null;
    return new Date(this.lastSync.getTime() + this.syncInterval * 60 * 1000);
  }
}

export enum CalendarProvider {
  GOOGLE = 'GOOGLE',
  OUTLOOK = 'OUTLOOK',
  ICAL = 'ICAL',
  INTERNAL = 'INTERNAL'
}
