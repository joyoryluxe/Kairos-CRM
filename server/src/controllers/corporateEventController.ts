import { Response } from 'express';
import CorporateEvent from '../models/CorporateEvent';
import { User } from '../models/User';
import { googleCalendarService } from '../services/googleCalendarService';
import { AuthRequest } from '../middleware/authenticate';

// Create a new Corporate Event record
export const createCorporateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const corporateEvent = await CorporateEvent.create(req.body);

    // Google Calendar Sync
    if (corporateEvent.eventDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent({
          summary: `Corporate Event: ${corporateEvent.clientName}`,
          description: `Event: ${corporateEvent.eventName || 'N/A'}\nPhone: ${corporateEvent.phoneNumber}\nPackage: ${corporateEvent.package || 'N/A'}`,
          start: corporateEvent.eventDateAndTime,
          end: new Date(corporateEvent.eventDateAndTime.getTime() + 4 * 60 * 60 * 1000),
        }, user.googleRefreshToken);
        
        if (eventId) {
          corporateEvent.googleCalendarEventId = eventId;
          await corporateEvent.save();
        }
      }
    }

    res.status(201).json({ success: true, data: corporateEvent });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all Corporate Event records
export const getCorporateEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const corporateEvents = await CorporateEvent.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: corporateEvents.length, data: corporateEvents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single Corporate Event record by ID
export const getCorporateEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const corporateEvent = await CorporateEvent.findById(req.params.id);
    if (!corporateEvent) {
      res.status(404).json({ success: false, message: 'Corporate Event record not found' });
      return;
    }
    res.status(200).json({ success: true, data: corporateEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a Corporate Event record
export const updateCorporateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const corporateEvent = await CorporateEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!corporateEvent) {
      res.status(404).json({ success: false, message: 'Corporate Event record not found' });
      return;
    }

    // Google Calendar Sync
    if (corporateEvent.eventDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent({
          id: corporateEvent.googleCalendarEventId,
          summary: `Corporate Event: ${corporateEvent.clientName}`,
          description: `Event: ${corporateEvent.eventName || 'N/A'}\nPhone: ${corporateEvent.phoneNumber}\nPackage: ${corporateEvent.package || 'N/A'}`,
          start: corporateEvent.eventDateAndTime,
          end: new Date(corporateEvent.eventDateAndTime.getTime() + 4 * 60 * 60 * 1000),
        }, user.googleRefreshToken);

        if (eventId && eventId !== corporateEvent.googleCalendarEventId) {
          corporateEvent.googleCalendarEventId = eventId;
          await corporateEvent.save();
        }
      }
    }

    res.status(200).json({ success: true, data: corporateEvent });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a Corporate Event record
export const deleteCorporateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const corporateEvent = await CorporateEvent.findByIdAndDelete(req.params.id);
    if (!corporateEvent) {
      res.status(404).json({ success: false, message: 'Corporate Event record not found' });
      return;
    }
    if (corporateEvent.googleCalendarEventId && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        await googleCalendarService.deleteEvent(corporateEvent.googleCalendarEventId, user.googleRefreshToken);
      }
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
