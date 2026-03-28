import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

/**
 * Thrown when Google revokes / invalidates the refresh token.
 * Callers should clear the stored token and prompt re-authorisation.
 */
export class InvalidGrantError extends Error {
  constructor() {
    super('Google refresh token is invalid or has been revoked (invalid_grant). Please reconnect Google Calendar.');
    this.name = 'InvalidGrantError';
  }
}

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
        try {
          const res = await this.calendar.events.update({
            auth,
            calendarId: 'primary',
            eventId: eventData.id,
            requestBody: event,
          });
          return res.data.id || null;
        } catch (updateError: any) {
          const status = updateError.status ?? updateError.response?.status;
          // 404 = the event was manually deleted from Google Calendar.
          // Fall through to insert a fresh one below.
          if (status !== 404 && status !== 410) throw updateError;
          console.warn(`Google Calendar: event ${eventData.id} not found (${status}), re-creating it.`);
          // Fall through ↓
        }
      }
      // Insert (either new record, or fallback after a 404 on update)
      const res = await this.calendar.events.insert({
        auth,
        calendarId: 'primary',
        requestBody: event,
      });
      return res.data.id || null;
    } catch (error: any) {
      const errPayload = error.response?.data?.error || error.message;
      console.error('Google Calendar API Error Details:', {
        message: error.message,
        status: error.status,
        errors: errPayload,
      });
      // invalid_grant means the refresh token has been revoked — propagate so
      // the caller can clear the stored token and ask the user to reconnect.
      if (errPayload === 'invalid_grant' || error.message === 'invalid_grant') {
        throw new InvalidGrantError();
      }
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
      const errPayload = error.response?.data?.error || error.message;
      if (errPayload === 'invalid_grant' || error.message === 'invalid_grant') {
        throw new InvalidGrantError();
      }
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
