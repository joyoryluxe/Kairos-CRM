import { Request, Response } from 'express';
import { google } from 'googleapis';
import { User } from '../models/User';
import Maternity from '../models/Maternity';
import Influencer from '../models/Influencer';
import CorporateEvent from '../models/CorporateEvent';
import { env } from '../config/env';
import { googleCalendarService } from '../services/googleCalendarService';

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

    if (!refreshToken) {
      // If we didn't get a refresh token, it means they've already consented once.
      // We might need to ask for consent again with prompt='consent' (which we already do above).
      // Or just continue if we already have it.
    }

    if (state) {
      const user = await User.findById(state);
      if (user) {
        if (refreshToken) {
          user.googleRefreshToken = refreshToken;
        }
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
    const [maternities, influencers, corporateEvents] = await Promise.all([
      Maternity.find({}),
      Influencer.find({}),
      CorporateEvent.find({}),
    ]);

    let count = 0;

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

    res.json({ success: true, message: `Successfully synced ${count} records with Google Calendar.` });
  } catch (error: any) {
    console.error('Sync All Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
