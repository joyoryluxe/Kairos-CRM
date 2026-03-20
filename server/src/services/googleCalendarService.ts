import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

/**
 * Event Data Interface for syncing
 */
export interface CalendarEventData {
  id?: string; // Existing Google Event ID
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}

class GoogleCalendarService {
  private calendar = google.calendar('v3');

  private getOAuthClient(refreshToken: string): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }

  /**
   * Upsert an event to Google Calendar
   * @returns The Google Event ID
   */
  async upsertEvent(eventData: CalendarEventData, refreshToken?: string): Promise<string | null> {
    if (!refreshToken) {
      console.warn('Google Calendar: No refresh token provided. Syncing skipped.');
      return null;
    }

    const auth = this.getOAuthClient(refreshToken);
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.start instanceof Date ? eventData.start.toISOString() : new Date(eventData.start).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.end instanceof Date ? eventData.end.toISOString() : new Date(eventData.end).toISOString(),
        timeZone: 'UTC',
      },
    };

    try {
      if (eventData.id) {
        const res = await this.calendar.events.update({
          auth,
          calendarId: 'primary',
          eventId: eventData.id,
          requestBody: event,
        });
        return res.data.id || null;
      } else {
        const res = await this.calendar.events.insert({
          auth,
          calendarId: 'primary',
          requestBody: event,
        });
        return res.data.id || null;
      }
    } catch (error: any) {
      console.error('Google Calendar API Error Details:', {
        message: error.message,
        status: error.status,
        errors: error.response?.data?.error,
      });
      return null;
    }
  }

  /**
   * Delete an event from Google Calendar
   */
  async deleteEvent(eventId: string, refreshToken?: string): Promise<boolean> {
    if (!refreshToken || !eventId) return false;

    const auth = this.getOAuthClient(refreshToken);

    try {
      await this.calendar.events.delete({
        auth,
        calendarId: 'primary',
        eventId: eventId,
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting Google Calendar event:', error.message);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
