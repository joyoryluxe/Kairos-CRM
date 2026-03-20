import { Response } from 'express';
import Influencer from '../models/Influencer';
import { User } from '../models/User';
import { googleCalendarService } from '../services/googleCalendarService';
import { AuthRequest } from '../middleware/authenticate';

// Create a new Influencer record
export const createInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const influencer = await Influencer.create(req.body);

    // Google Calendar Sync
    if (influencer.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent({
          summary: `Influencer Shoot: ${influencer.clientName}`,
          description: `Shoot: ${influencer.shootName || 'N/A'}\nPhone: ${influencer.phoneNumber}\nInsta: ${influencer.instaId || 'N/A'}`,
          start: influencer.shootDateAndTime,
          end: new Date(influencer.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
        }, user.googleRefreshToken);
        
        if (eventId) {
          influencer.googleCalendarEventId = eventId;
          await influencer.save();
        }
      }
    }

    res.status(201).json({ success: true, data: influencer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all Influencer records
export const getInfluencers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queryObj = { ...req.query };
    
    // Remove pagination/sort fields if they exist from typical express usage
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Apply regex search for string fields for partial matching
    const stringFields = ['clientName', 'phoneNumber', 'instaId', 'referredBy', 'shootName'];
    stringFields.forEach(field => {
      if (queryObj[field]) {
        queryObj[field] = { $regex: queryObj[field], $options: 'i' };
      }
    });

    // Exact matches for package, status, etc., will remain as strings in queryObj.
    const influencers = await Influencer.find(queryObj).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: influencers.length, data: influencers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single Influencer record by ID
export const getInfluencerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      res.status(404).json({ success: false, message: 'Influencer record not found' });
      return;
    }
    res.status(200).json({ success: true, data: influencer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an Influencer record
export const updateInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const influencer = await Influencer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!influencer) {
      res.status(404).json({ success: false, message: 'Influencer record not found' });
      return;
    }

    // Google Calendar Sync
    if (influencer.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent({
          id: influencer.googleCalendarEventId,
          summary: `Influencer Shoot: ${influencer.clientName}`,
          description: `Shoot: ${influencer.shootName || 'N/A'}\nPhone: ${influencer.phoneNumber}\nInsta: ${influencer.instaId || 'N/A'}`,
          start: influencer.shootDateAndTime,
          end: new Date(influencer.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
        }, user.googleRefreshToken);

        if (eventId && eventId !== influencer.googleCalendarEventId) {
          influencer.googleCalendarEventId = eventId;
          await influencer.save();
        }
      }
    }

    res.status(200).json({ success: true, data: influencer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an Influencer record
export const deleteInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const influencer = await Influencer.findByIdAndDelete(req.params.id);
    if (!influencer) {
      res.status(404).json({ success: false, message: 'Influencer record not found' });
      return;
    }
    if (influencer.googleCalendarEventId && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        await googleCalendarService.deleteEvent(influencer.googleCalendarEventId, user.googleRefreshToken);
      }
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
