import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';

/**
 * Outlook Calendar Service (RF-08)
 * Handles integration with Microsoft Graph API for Outlook Calendar
 */
@Injectable()
export class OutlookCalendarService {
  private readonly logger = new Logger(OutlookCalendarService.name);
  private readonly graphApiUrl = 'https://graph.microsoft.com/v1.0';

  /**
   * Validate Outlook Calendar credentials
   */
  async validateCredentials(credentials: any): Promise<void> {
    if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
      throw new BadRequestException('Outlook Calendar credentials must include clientId, clientSecret, and refreshToken');
    }

    try {
      // Get access token using refresh token
      const accessToken = await this.getAccessToken(credentials);
      
      // Test the credentials by making a simple API call
      await axios.get(`${this.graphApiUrl}/me/calendars`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('Outlook Calendar credentials validated successfully');
    } catch (error) {
      this.logger.error('Failed to validate Outlook Calendar credentials:', error);
      throw new BadRequestException('Invalid Outlook Calendar credentials');
    }
  }

  /**
   * Fetch events from Outlook Calendar
   */
  async fetchEvents(credentials: any, calendarId?: string): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken(credentials);
      
      // Get events for the next 30 days
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);

      const endpoint = calendarId 
        ? `${this.graphApiUrl}/me/calendars/${calendarId}/events`
        : `${this.graphApiUrl}/me/events`;

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          startDateTime: now.toISOString(),
          endDateTime: futureDate.toISOString(),
          $orderby: 'start/dateTime',
          $top: 250
        }
      });

      const events = response.data.value || [];
      
      return events.map((event: any) => ({
        externalEventId: event.id,
        title: event.subject || 'Untitled Event',
        description: event.body?.content || '',
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        isAllDay: event.isAllDay || false,
        location: event.location?.displayName || '',
        attendees: event.attendees?.map((attendee: any) => attendee.emailAddress?.address) || [],
        status: this.mapOutlookEventStatus(event.showAs),
        lastModified: new Date(event.lastModifiedDateTime || ''),
        metadata: {
          outlookEventId: event.id,
          webLink: event.webLink,
          organizer: event.organizer?.emailAddress?.address,
          importance: event.importance,
          sensitivity: event.sensitivity
        }
      }));
    } catch (error) {
      this.logger.error('Failed to fetch Outlook Calendar events:', error);
      throw error;
    }
  }

  /**
   * Create an event in Outlook Calendar
   */
  async createEvent(credentials: any, calendarId: string | undefined, eventData: any): Promise<string> {
    try {
      const accessToken = await this.getAccessToken(credentials);

      const endpoint = calendarId 
        ? `${this.graphApiUrl}/me/calendars/${calendarId}/events`
        : `${this.graphApiUrl}/me/events`;

      const event = {
        subject: eventData.title,
        body: {
          contentType: 'text',
          content: eventData.description
        },
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        location: {
          displayName: eventData.location
        },
        attendees: eventData.attendees?.map((email: string) => ({
          emailAddress: {
            address: email,
            name: email
          }
        }))
      };

      const response = await axios.post(endpoint, event, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Created Outlook Calendar event: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to create Outlook Calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an event in Outlook Calendar
   */
  async updateEvent(credentials: any, calendarId: string | undefined, eventId: string, eventData: any): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(credentials);

      const endpoint = calendarId 
        ? `${this.graphApiUrl}/me/calendars/${calendarId}/events/${eventId}`
        : `${this.graphApiUrl}/me/events/${eventId}`;

      const event = {
        subject: eventData.title,
        body: {
          contentType: 'text',
          content: eventData.description
        },
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'America/Bogota'
        },
        location: {
          displayName: eventData.location
        },
        attendees: eventData.attendees?.map((email: string) => ({
          emailAddress: {
            address: email,
            name: email
          }
        }))
      };

      await axios.patch(endpoint, event, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Updated Outlook Calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to update Outlook Calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from Outlook Calendar
   */
  async deleteEvent(credentials: any, calendarId: string | undefined, eventId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(credentials);

      const endpoint = calendarId 
        ? `${this.graphApiUrl}/me/calendars/${calendarId}/events/${eventId}`
        : `${this.graphApiUrl}/me/events/${eventId}`;

      await axios.delete(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Deleted Outlook Calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete Outlook Calendar event:', error);
      throw error;
    }
  }

  /**
   * Get access token using refresh token
   */
  private async getAccessToken(credentials: any): Promise<string> {
    try {
      const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', 
        new URLSearchParams({
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          refresh_token: credentials.refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/calendars.readwrite offline_access'
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to get Outlook access token:', error);
      throw new BadRequestException('Failed to authenticate with Outlook');
    }
  }

  /**
   * Map Outlook event status to internal status
   */
  private mapOutlookEventStatus(showAs?: string): string {
    switch (showAs) {
      case 'busy':
        return 'CONFIRMED';
      case 'tentative':
        return 'TENTATIVE';
      case 'free':
        return 'FREE';
      case 'oof':
        return 'OUT_OF_OFFICE';
      default:
        return 'CONFIRMED';
    }
  }
}
