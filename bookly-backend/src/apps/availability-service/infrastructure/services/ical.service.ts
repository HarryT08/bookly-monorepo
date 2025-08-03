import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as ical from 'ical';

/**
 * iCal Service (RF-08)
 * Handles integration with iCal calendar feeds
 */
@Injectable()
export class ICalService {
  private readonly logger = new Logger(ICalService.name);

  /**
   * Validate iCal credentials
   */
  async validateCredentials(credentials: any): Promise<void> {
    if (!credentials.url) {
      throw new BadRequestException('iCal credentials must include a valid URL');
    }

    try {
      // Test the URL by fetching the calendar
      const response = await axios.get(credentials.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Bookly-Calendar-Integration/1.0'
        }
      });

      if (!response.data || typeof response.data !== 'string') {
        throw new Error('Invalid iCal format');
      }

      // Try to parse the iCal data
      const parsedData = ical.parseICS(response.data);
      if (!parsedData || Object.keys(parsedData).length === 0) {
        throw new Error('No events found in iCal feed');
      }

      this.logger.log('iCal credentials validated successfully');
    } catch (error) {
      this.logger.error('Failed to validate iCal credentials:', error);
      throw new BadRequestException('Invalid iCal URL or format');
    }
  }

  /**
   * Fetch events from iCal feed
   */
  async fetchEvents(credentials: any, calendarId?: string): Promise<any[]> {
    try {
      const response = await axios.get(credentials.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Bookly-Calendar-Integration/1.0'
        }
      });

      const parsedData = ical.parseICS(response.data);
      const events = [];

      for (const key in parsedData) {
        const event = parsedData[key];
        
        if (event.type === 'VEVENT') {
          // Filter events for the next 30 days
          const now = new Date();
          const futureDate = new Date();
          futureDate.setDate(now.getDate() + 30);

          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);

          if (eventStart >= now && eventStart <= futureDate) {
            events.push({
              externalEventId: event.uid || key,
              title: event.summary || 'Untitled Event',
              description: event.description || '',
              startTime: eventStart,
              endTime: eventEnd,
              isAllDay: this.isAllDayEvent(event),
              location: event.location || '',
              attendees: this.extractAttendees(event),
              status: this.mapICalEventStatus(event.status),
              lastModified: event.dtstamp ? new Date(event.dtstamp) : new Date(),
              metadata: {
                icalUid: event.uid,
                icalUrl: credentials.url,
                organizer: event.organizer,
                categories: event.categories,
                priority: event.priority
              }
            });
          }
        }
      }

      this.logger.log(`Fetched ${events.length} events from iCal feed`);
      return events;
    } catch (error) {
      this.logger.error('Failed to fetch iCal events:', error);
      throw error;
    }
  }

  /**
   * Create an event in iCal (not supported - read-only)
   */
  async createEvent(credentials: any, calendarId: string | undefined, eventData: any): Promise<string> {
    throw new BadRequestException('Creating events in iCal feeds is not supported (read-only)');
  }

  /**
   * Update an event in iCal (not supported - read-only)
   */
  async updateEvent(credentials: any, calendarId: string | undefined, eventId: string, eventData: any): Promise<void> {
    throw new BadRequestException('Updating events in iCal feeds is not supported (read-only)');
  }

  /**
   * Delete an event from iCal (not supported - read-only)
   */
  async deleteEvent(credentials: any, calendarId: string | undefined, eventId: string): Promise<void> {
    throw new BadRequestException('Deleting events from iCal feeds is not supported (read-only)');
  }

  /**
   * Check if an event is all-day
   */
  private isAllDayEvent(event: any): boolean {
    // If the event has no time component, it's all-day
    if (event.start && typeof event.start === 'string') {
      return !event.start.includes('T');
    }
    
    // If start and end are exactly 24 hours apart and start at midnight
    if (event.start && event.end) {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      return diffHours === 24 && 
             start.getHours() === 0 && 
             start.getMinutes() === 0 && 
             start.getSeconds() === 0;
    }
    
    return false;
  }

  /**
   * Extract attendees from iCal event
   */
  private extractAttendees(event: any): string[] {
    const attendees = [];
    
    if (event.attendee) {
      if (Array.isArray(event.attendee)) {
        for (const attendee of event.attendee) {
          const email = this.extractEmailFromAttendee(attendee);
          if (email) attendees.push(email);
        }
      } else {
        const email = this.extractEmailFromAttendee(event.attendee);
        if (email) attendees.push(email);
      }
    }
    
    return attendees;
  }

  /**
   * Extract email from attendee string
   */
  private extractEmailFromAttendee(attendee: any): string | null {
    if (typeof attendee === 'string') {
      const match = attendee.match(/mailto:([^;]+)/i);
      return match ? match[1] : null;
    }
    
    if (attendee && attendee.val) {
      const match = attendee.val.match(/mailto:([^;]+)/i);
      return match ? match[1] : null;
    }
    
    return null;
  }

  /**
   * Map iCal event status to internal status
   */
  private mapICalEventStatus(status?: string): string {
    if (!status) return 'CONFIRMED';
    
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'CONFIRMED';
      case 'TENTATIVE':
        return 'TENTATIVE';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'CONFIRMED';
    }
  }
}
