import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';

/**
 * Google Calendar Service (RF-08)
 * Handles integration with Google Calendar API
 */
@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  /**
   * Validate Google Calendar credentials
   */
  async validateCredentials(credentials: any): Promise<void> {
    if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
      throw new BadRequestException('Google Calendar credentials must include clientId, clientSecret, and refreshToken');
    }

    try {
      const auth = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      auth.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken
      });

      // Test the credentials by making a simple API call
      const calendar = google.calendar({ version: 'v3', auth });
      await calendar.calendarList.list({ maxResults: 1 });

      this.logger.log('Google Calendar credentials validated successfully');
    } catch (error) {
      this.logger.error('Failed to validate Google Calendar credentials:', error);
      throw new BadRequestException('Invalid Google Calendar credentials');
    }
  }

  /**
   * Fetch events from Google Calendar
   */
  async fetchEvents(credentials: any, calendarId: string = 'primary'): Promise<any[]> {
    try {
      const auth = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      auth.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth });
      
      // Get events for the next 30 days
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);

      const response = await calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250
      });

      const events = response.data.items || [];
      
      return events.map(event => ({
        externalEventId: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        startTime: new Date(event.start?.dateTime || event.start?.date || ''),
        endTime: new Date(event.end?.dateTime || event.end?.date || ''),
        isAllDay: !event.start?.dateTime, // If no dateTime, it's an all-day event
        location: event.location || '',
        attendees: event.attendees?.map(attendee => attendee.email) || [],
        status: this.mapGoogleEventStatus(event.status),
        lastModified: new Date(event.updated || ''),
        metadata: {
          googleEventId: event.id,
          htmlLink: event.htmlLink,
          creator: event.creator?.email,
          organizer: event.organizer?.email
        }
      }));
    } catch (error) {
      this.logger.error('Failed to fetch Google Calendar events:', error);
      throw error;
    }
  }

  /**
   * Create an event in Google Calendar
   */
  async createEvent(credentials: any, calendarId: string, eventData: any): Promise<string> {
    try {
      const auth = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      auth.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        location: eventData.location,
        attendees: eventData.attendees?.map((email: string) => ({ email }))
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event
      });

      this.logger.log(`Created Google Calendar event: ${response.data.id}`);
      return response.data.id!;
    } catch (error) {
      this.logger.error('Failed to create Google Calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an event in Google Calendar
   */
  async updateEvent(credentials: any, calendarId: string, eventId: string, eventData: any): Promise<void> {
    try {
      const auth = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      auth.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        location: eventData.location,
        attendees: eventData.attendees?.map((email: string) => ({ email }))
      };

      await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event
      });

      this.logger.log(`Updated Google Calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to update Google Calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from Google Calendar
   */
  async deleteEvent(credentials: any, calendarId: string, eventId: string): Promise<void> {
    try {
      const auth = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      auth.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId,
        eventId
      });

      this.logger.log(`Deleted Google Calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete Google Calendar event:', error);
      throw error;
    }
  }

  /**
   * Map Google Calendar event status to internal status
   */
  private mapGoogleEventStatus(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'tentative':
        return 'TENTATIVE';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'CONFIRMED';
    }
  }
}
