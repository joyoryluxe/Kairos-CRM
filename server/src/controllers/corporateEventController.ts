import { Response } from 'express';
import CorporateEvent from '../models/CorporateEvent';
import { User } from '../models/User';
import { googleCalendarService } from '../services/googleCalendarService';
import { AuthRequest } from '../middleware/authenticate';

// Create a new Corporate Event record
export const createCorporateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Normalize date fields: convert empty strings to null to avoid Mongoose validation errors
    if (req.body.eventDateAndTime === "") req.body.eventDateAndTime = null;
    if (req.body.deliveryDeadline === "") req.body.deliveryDeadline = null;

    // Ensure extras and payments are arrays if provided
    if (req.body.extras === "") req.body.extras = [];
    if (req.body.payments === "") req.body.payments = [];
    
    // Normalize dates inside payments array
    if (Array.isArray(req.body.payments)) {
      req.body.payments.forEach((p: any) => {
        if (p.date === "") p.date = null;
      });
    }

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

export const getCorporateEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      clientName,
      phoneNumber,
      eventName,
      city,
      notes,
      eventDateFrom,
      eventDateTo,
      deliveryDeadlineFrom,
      deliveryDeadlineTo,
      status,
      package: packageName,
      paymentStatus
    } = req.query;

    const filter: Record<string, any> = {};

    // 1. Case-insensitive regex filters
    if (clientName) filter.clientName = { $regex: clientName, $options: 'i' };
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    if (eventName) filter.eventName = { $regex: eventName, $options: 'i' };
    if (notes) filter.notes = { $regex: notes, $options: 'i' };
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    // 2. Exact match filters
    if (status) filter.status = status;
    if (packageName) filter.package = packageName;

    // 3. Date range filters
    if (eventDateFrom || eventDateTo) {
      filter.eventDateAndTime = {};
      if (eventDateFrom) filter.eventDateAndTime.$gte = new Date(eventDateFrom as string);
      if (eventDateTo) filter.eventDateAndTime.$lte = new Date(eventDateTo as string);
    }

    if (deliveryDeadlineFrom || deliveryDeadlineTo) {
      filter.deliveryDeadline = {};
      if (deliveryDeadlineFrom) filter.deliveryDeadline.$gte = new Date(deliveryDeadlineFrom as string);
      if (deliveryDeadlineTo) filter.deliveryDeadline.$lte = new Date(deliveryDeadlineTo as string);
    }

    // 4. Payment Status
    if (paymentStatus === 'pending') {
      filter.balance = { $gt: 0 };
    } else if (paymentStatus === 'paid') {
      filter.balance = { $lte: 0 };
    }

    const corporateEvents = await CorporateEvent.find(filter).sort({ createdAt: -1 });

    // Summary calculation based on FILTERED data
    const summary = {
      total: corporateEvents.length,
      totalRevenue: corporateEvents.reduce((sum, e) => sum + (e.total || 0), 0),
      totalReceived: corporateEvents.reduce((sum, e) => sum + (e.advance || 0), 0),
      totalDue: corporateEvents.reduce((sum, e) => sum + Math.max(e.balance || 0, 0), 0),
      totalExpenses: corporateEvents.reduce((sum, e) => sum + (e.expenses || 0), 0),
      totalProfit: corporateEvents.reduce((sum, e) => sum + ((e.total || 0) - (e.expenses || 0)), 0),
    };

    res.status(200).json({ success: true, summary, data: corporateEvents });
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
    // Normalize date fields: convert empty strings to null to avoid Mongoose validation errors
    if (req.body.eventDateAndTime === "") req.body.eventDateAndTime = null;
    if (req.body.deliveryDeadline === "") req.body.deliveryDeadline = null;

    // Normalize dates inside payments array if it's being updated
    if (Array.isArray(req.body.payments)) {
      req.body.payments.forEach((p: any) => {
        if (p.date === "") p.date = null;
      });
    }

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
