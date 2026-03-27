// import { Response } from 'express';
// import Influencer from '../models/Influencer';
// import { User } from '../models/User';
// import { googleCalendarService } from '../services/googleCalendarService';
// import { AuthRequest } from '../middleware/authenticate';

// // Create a new Influencer record
// export const createInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     // Normalize date fields: convert empty strings to null to avoid Mongoose validation errors
//     if (req.body.shootDateAndTime === "") req.body.shootDateAndTime = null;
//     if (req.body.deliveryDeadline === "") req.body.deliveryDeadline = null;

//     // Ensure extras and payments are arrays if provided
//     if (req.body.extras === "") req.body.extras = [];
//     if (req.body.payments === "") req.body.payments = [];

//     // Normalize dates inside payments array
//     if (Array.isArray(req.body.payments)) {
//       req.body.payments.forEach((p: any) => {
//         if (p.date === "") p.date = null;
//       });
//     }

//     const influencer = await Influencer.create(req.body);

//     // Google Calendar Sync
//     if (influencer.shootDateAndTime && req.user) {
//       const user = await User.findById(req.user.id).select('+googleRefreshToken');
//       if (user?.googleRefreshToken) {
//         const eventId = await googleCalendarService.upsertEvent({
//           summary: `Influencer Shoot: ${influencer.clientName}`,
//           description: `Shoot: ${influencer.shootName || 'N/A'}\nPhone: ${influencer.phoneNumber}\nInsta: ${influencer.instaId || 'N/A'}`,
//           start: influencer.shootDateAndTime,
//           end: new Date(influencer.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
//         }, user.googleRefreshToken);

//         if (eventId) {
//           influencer.googleCalendarEventId = eventId;
//           await influencer.save();
//         }
//       }
//     }

//     res.status(201).json({ success: true, data: influencer });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Get all Influencer records
// export const getInfluencers = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const queryObj = { ...req.query };

//     // Remove pagination/sort fields if they exist from typical express usage
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach(el => delete queryObj[el]);

//     // Apply regex search for string fields for partial matching
//     const stringFields = ['clientName', 'phoneNumber', 'instaId', 'referredBy', 'shootName'];
//     stringFields.forEach(field => {
//       if (queryObj[field]) {
//         queryObj[field] = { $regex: queryObj[field], $options: 'i' };
//       }
//     });

//     // Exact matches for package, status, etc., will remain as strings in queryObj.
//     const influencers = await Influencer.find(queryObj).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: influencers.length, data: influencers });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get a single Influencer record by ID
// export const getInfluencerById = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const influencer = await Influencer.findById(req.params.id);
//     if (!influencer) {
//       res.status(404).json({ success: false, message: 'Influencer record not found' });
//       return;
//     }
//     res.status(200).json({ success: true, data: influencer });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update an Influencer record
// export const updateInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     // Normalize date fields: convert empty strings to null to avoid Mongoose validation errors
//     if (req.body.shootDateAndTime === "") req.body.shootDateAndTime = null;
//     if (req.body.deliveryDeadline === "") req.body.deliveryDeadline = null;

//     // Normalize dates inside payments array if it's being updated
//     if (Array.isArray(req.body.payments)) {
//       req.body.payments.forEach((p: any) => {
//         if (p.date === "") p.date = null;
//       });
//     }

//     const influencer = await Influencer.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!influencer) {
//       res.status(404).json({ success: false, message: 'Influencer record not found' });
//       return;
//     }

//     // Google Calendar Sync
//     if (influencer.shootDateAndTime && req.user) {
//       const user = await User.findById(req.user.id).select('+googleRefreshToken');
//       if (user?.googleRefreshToken) {
//         const eventId = await googleCalendarService.upsertEvent({
//           id: influencer.googleCalendarEventId,
//           summary: `Influencer Shoot: ${influencer.clientName}`,
//           description: `Shoot: ${influencer.shootName || 'N/A'}\nPhone: ${influencer.phoneNumber}\nInsta: ${influencer.instaId || 'N/A'}`,
//           start: influencer.shootDateAndTime,
//           end: new Date(influencer.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
//         }, user.googleRefreshToken);

//         if (eventId && eventId !== influencer.googleCalendarEventId) {
//           influencer.googleCalendarEventId = eventId;
//           await influencer.save();
//         }
//       }
//     }

//     res.status(200).json({ success: true, data: influencer });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Delete an Influencer record
// export const deleteInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const influencer = await Influencer.findByIdAndDelete(req.params.id);
//     if (!influencer) {
//       res.status(404).json({ success: false, message: 'Influencer record not found' });
//       return;
//     }
//     if (influencer.googleCalendarEventId && req.user) {
//       const user = await User.findById(req.user.id).select('+googleRefreshToken');
//       if (user?.googleRefreshToken) {
//         await googleCalendarService.deleteEvent(influencer.googleCalendarEventId, user.googleRefreshToken);
//       }
//     }

//     res.status(200).json({ success: true, data: {} });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };















import { Response } from 'express';
import Influencer from '../models/Influencer';
import { User } from '../models/User';
import { googleCalendarService } from '../services/googleCalendarService';
import { AuthRequest } from '../middleware/authenticate';

// ─── Shared sanitizer ─────────────────────────────────────────────────────────
/**
 * Normalize the request body before it reaches Mongoose.
 *
 * Fixes addressed:
 *  1. `package: ""` → undefined   (was failing the enum validator → 400)
 *  2. `shootDateAndTime: ""` → null
 *  3. `deliveryDeadline: ""` → null
 *  4. Empty strings inside payments[].date → null
 *  5. Non-array extras / payments → []
 */
function sanitizeBody(body: any): void {
  // Date fields — Mongoose rejects "" as an invalid Date
  if (body.shootDateAndTime === '') body.shootDateAndTime = null;
  if (body.deliveryDeadline === '') body.deliveryDeadline = null;

  // Package — enum (and later: any string) field must not be empty string
  if (body.package === '') body.package = undefined;

  // Array fields — guard against accidental string values
  if (!Array.isArray(body.extras)) body.extras = [];
  if (!Array.isArray(body.payments)) body.payments = [];

  // Normalize dates inside payments
  body.payments.forEach((p: any) => {
    if (p.date === '') p.date = null;
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────
export const createInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    sanitizeBody(req.body);

    const influencer = await Influencer.create(req.body);

    // Google Calendar Sync
    if (influencer.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent(
          {
            summary: `Influencer Shoot: ${influencer.clientName}`,
            description: `Shoot: ${influencer.shootName || 'N/A'}\nPhone: ${influencer.phoneNumber}\nInsta: ${influencer.instaId || 'N/A'}`,
            start: influencer.shootDateAndTime,
            end: new Date(influencer.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
          },
          user.googleRefreshToken,
        );
        if (eventId) {
          influencer.googleCalendarEventId = eventId;
          await influencer.save();
        }
      }
    }

    res.status(201).json({ success: true, data: influencer });
  } catch (error: any) {
    console.error('CREATE INFLUENCER ERROR:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get All ──────────────────────────────────────────────────────────────────
export const getInfluencers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      clientName,
      phoneNumber,
      instaId,
      referredBy,
      shootName,
      status,
      package: packageName,
      city,
      shootDateFrom,
      shootDateTo,
      deliveryDeadlineFrom,
      deliveryDeadlineTo,
      paymentStatus,
    } = req.query;

    const filter: any = {};

    // Text search fields (Case-insensitive regex)
    if (clientName) filter.clientName = { $regex: clientName, $options: 'i' };
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    if (instaId) filter.instaId = { $regex: instaId, $options: 'i' };
    if (referredBy) filter.referredBy = { $regex: referredBy, $options: 'i' };
    if (shootName) filter.shootName = { $regex: shootName, $options: 'i' };
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };

    // Exact match fields
    if (status) filter.status = status;
    if (packageName) filter.package = packageName;

    // Date Range: Shoot Date
    if (shootDateFrom || shootDateTo) {
      filter.shootDateAndTime = {};
      if (shootDateFrom) filter.shootDateAndTime.$gte = new Date(shootDateFrom as string);
      if (shootDateTo) filter.shootDateAndTime.$lte = new Date(shootDateTo as string);
    }

    // Date Range: Delivery Deadline
    if (deliveryDeadlineFrom || deliveryDeadlineTo) {
      filter.deliveryDeadline = {};
      if (deliveryDeadlineFrom) filter.deliveryDeadline.$gte = new Date(deliveryDeadlineFrom as string);
      if (deliveryDeadlineTo) filter.deliveryDeadline.$lte = new Date(deliveryDeadlineTo as string);
    }

    // Payment Status
    if (paymentStatus === 'pending') {
      filter.balance = { $gt: 0 };
    } else if (paymentStatus === 'paid') {
      filter.balance = { $lte: 0 };
    }

    const influencers = await Influencer.find(filter).sort({ createdAt: -1 });

    // Summary calculation based on FILTERED data
    const summary = {
      total: influencers.length,
      totalRevenue: influencers.reduce((sum, i) => sum + (i.total || 0), 0),
      totalReceived: influencers.reduce((sum, i) => sum + (i.advance || 0), 0),
      totalDue: influencers.reduce((sum, i) => sum + Math.max(i.balance || 0, 0), 0),
      totalExpenses: influencers.reduce((sum, i) => sum + (i.expenses || 0), 0),
      totalProfit: influencers.reduce((sum, i) => sum + (i.profit || 0), 0),
    };

    res.status(200).json({ success: true, summary, data: influencers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get One ──────────────────────────────────────────────────────────────────
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

// ─── Update ───────────────────────────────────────────────────────────────────
export const updateInfluencer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    sanitizeBody(req.body);

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
        const eventId = await googleCalendarService.upsertEvent(
          {
            id: influencer.googleCalendarEventId,
            summary: `Influencer Shoot: ${influencer.clientName}`,
            description: `Shoot: ${influencer.shootName || 'N/A'}\nPhone: ${influencer.phoneNumber}\nInsta: ${influencer.instaId || 'N/A'}`,
            start: influencer.shootDateAndTime,
            end: new Date(influencer.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
          },
          user.googleRefreshToken,
        );
        if (eventId && eventId !== influencer.googleCalendarEventId) {
          influencer.googleCalendarEventId = eventId;
          await influencer.save();
        }
      }
    }

    res.status(200).json({ success: true, data: influencer });
  } catch (error: any) {
    console.error('UPDATE INFLUENCER ERROR:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
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
        await googleCalendarService.deleteEvent(
          influencer.googleCalendarEventId,
          user.googleRefreshToken,
        );
      }
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};