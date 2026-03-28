import { Request, Response } from 'express';
import { google } from 'googleapis';
import { User } from '../models/User';
import Maternity from '../models/Maternity';
import Influencer from '../models/Influencer';
import CorporateEvent from '../models/CorporateEvent';
import Lead from '../models/Lead';
import Edit from '../models/Edit';
import { env } from '../config/env';
import { googleCalendarService, InvalidGrantError } from '../services/googleCalendarService';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
    state: (req as any).user?.id, // Pass user ID in state to link back
  });
  res.json({ success: true, url });
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    const refreshToken = tokens.refresh_token;

    if (state) {
      const user = await User.findById(state);
      if (user) {
        if (refreshToken) {
          // Always store the newest refresh token.
          user.googleRefreshToken = refreshToken;
          user.googleCalendarConnected = true;
        } else if (!user.googleRefreshToken) {
          // No new token and no existing token — connection incomplete.
          console.warn('Google Auth: No refresh token returned and no token on file. Prompt re-consent.');
          return res.redirect(`${env.CLIENT_ORIGIN}/dashboard?googleError=${encodeURIComponent('No refresh token received. Please disconnect and reconnect your Google account.')}`);
        }
        // If refreshToken is undefined but we already have one stored, keep the existing one.
        user.googleCalendarConnected = true;
        await user.save();
      }
    }

    // Redirect user back to frontend
    // Redirect user back to frontend with a clean URL
    res.redirect(`${env.CLIENT_ORIGIN}/dashboard?googleConnected=true`);
  } catch (error: any) {
    console.error('Google Auth Callback Error:', error);
    // If it's a "code already used" or similar, it might still have connected.
    res.redirect(`${env.CLIENT_ORIGIN}/dashboard?googleError=${encodeURIComponent(error.message)}`);
  }
};

export const syncAll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('+googleRefreshToken');
    if (!user || !user.googleRefreshToken) {
      return res.status(400).json({ success: false, message: 'Google Calendar not connected' });
    }

    // Fetch all records from all modules
    const [maternities, influencers, corporateEvents, leads, edits] = await Promise.all([
      Maternity.find({}),
      Influencer.find({}),
      CorporateEvent.find({}),
      Lead.find({ eventDate: { $exists: true, $ne: null } }),
      Edit.find({ deadline: { $exists: true, $ne: null }, status: { $nin: ['Done', 'Delivered'] } }),
    ]);

    let count = 0;

    try {
      // Sync Maternity
      for (const m of maternities) {
        if (m.shootDateAndTime) {
          const eventId = await googleCalendarService.upsertEvent({
            id: m.googleCalendarEventId,
            summary: `Maternity Shoot: ${m.clientName}`,
            description: `Package: ${m.package || 'N/A'}\nPhone: ${m.phoneNumber}`,
            start: m.shootDateAndTime,
            end: new Date(m.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
          }, user.googleRefreshToken);
          if (eventId) {
            if (eventId !== m.googleCalendarEventId) {
              m.googleCalendarEventId = eventId;
              await m.save();
            }
            count++;
          }
        }
      }

      // Sync Influencers
      for (const i of influencers) {
        if (i.shootDateAndTime) {
          const eventId = await googleCalendarService.upsertEvent({
            id: i.googleCalendarEventId,
            summary: `Influencer Shoot: ${i.clientName}`,
            description: `Shoot: ${i.shootName || 'N/A'}\nPhone: ${i.phoneNumber}`,
            start: i.shootDateAndTime,
            end: new Date(i.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
          }, user.googleRefreshToken);
          if (eventId) {
            if (eventId !== i.googleCalendarEventId) {
              i.googleCalendarEventId = eventId;
              await i.save();
            }
            count++;
          }
        }
      }

      // Sync Corporate
      for (const c of corporateEvents) {
        if (c.eventDateAndTime) {
          const eventId = await googleCalendarService.upsertEvent({
            id: c.googleCalendarEventId,
            summary: `Corporate Event: ${c.clientName}`,
            description: `Event: ${c.eventName || 'N/A'}\nPhone: ${c.phoneNumber}`,
            start: c.eventDateAndTime,
            end: new Date(c.eventDateAndTime.getTime() + 4 * 60 * 60 * 1000),
          }, user.googleRefreshToken);
          if (eventId) {
            if (eventId !== c.googleCalendarEventId) {
              c.googleCalendarEventId = eventId;
              await c.save();
            }
            count++;
          }
        }
      }

      // Sync Leads (eventDate) — only leads that have a set event date
      for (const l of leads) {
        if (l.eventDate) {
          const eventId = await googleCalendarService.upsertEvent({
            id: l.googleCalendarEventId,
            summary: `Lead Event: ${l.clientName} (${l.eventType})`,
            description: `Status: ${l.status}\nPhone: ${l.phoneNumber}${l.eventLocation ? `\nLocation: ${l.eventLocation}` : ''}${l.budget ? `\nBudget: ₹${l.budget}` : ''}`,
            start: l.eventDate,
            end: new Date(l.eventDate.getTime() + 2 * 60 * 60 * 1000),
          }, user.googleRefreshToken);
          if (eventId) {
            if (eventId !== l.googleCalendarEventId) {
              l.googleCalendarEventId = eventId;
              await l.save();
            }
            count++;
          }
        }
      }

      // Sync Edits (commitment deadline) — only active edits (not Done/Delivered)
      for (const e of edits) {
        if (e.deadline) {
          // Use start-of-day for deadline so it shows as an all-day-style marker
          const deadlineStart = new Date(e.deadline);
          deadlineStart.setHours(9, 0, 0, 0); // 9 AM on deadline day
          const deadlineEnd = new Date(deadlineStart.getTime() + 60 * 60 * 1000); // 1 hr block
          const eventId = await googleCalendarService.upsertEvent({
            id: e.googleCalendarEventId,
            summary: `✂️ Edit Deadline: ${e.clientName} — ${e.title}`,
            description: `Type: ${e.type}\nPriority: ${e.priority}\nStatus: ${e.status}\nPhotos/Clips: ${e.photoClipCount}${e.notes ? `\nNotes: ${e.notes}` : ''}`,
            start: deadlineStart,
            end: deadlineEnd,
          }, user.googleRefreshToken);
          if (eventId) {
            if (eventId !== e.googleCalendarEventId) {
              e.googleCalendarEventId = eventId;
              await e.save();
            }
            count++;
          }
        }
      }

    } catch (syncError) {
      if (syncError instanceof InvalidGrantError) {
        // The stored refresh token is no longer valid — clear it so the UI
        // shows the "Connect Google" button again.
        console.warn(`syncAll: ${syncError.message} — clearing stored token for user ${userId}`);
        user.googleRefreshToken = undefined;
        user.googleCalendarConnected = false;
        await user.save();
        return res.status(401).json({
          success: false,
          code: 'INVALID_GRANT',
          message: 'Your Google Calendar connection has expired or been revoked. Please reconnect your Google account.',
        });
      }
      throw syncError; // re-throw unexpected errors
    }

    res.json({ success: true, message: `Successfully synced ${count} records with Google Calendar.` });
  } catch (error: any) {
    console.error('Sync All Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
