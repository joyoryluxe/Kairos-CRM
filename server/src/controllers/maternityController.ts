// import { Request, Response } from 'express';
// import Maternity from '../models/Maternity';

// // Create a new Maternity record
// export const createMaternity = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const maternity = await Maternity.create(req.body);
//     res.status(201).json({ success: true, data: maternity });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Get all Maternity records
// export const getMaternities = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const maternities = await Maternity.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: maternities.length, data: maternities });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get a single Maternity record by ID
// export const getMaternityById = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const maternity = await Maternity.findById(req.params.id);
//     if (!maternity) {
//       res.status(404).json({ success: false, message: 'Maternity record not found' });
//       return;
//     }
//     res.status(200).json({ success: true, data: maternity });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update a Maternity record
// export const updateMaternity = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const maternity = await Maternity.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!maternity) {
//       res.status(404).json({ success: false, message: 'Maternity record not found' });
//       return;
//     }
//     res.status(200).json({ success: true, data: maternity });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Delete a Maternity record
// export const deleteMaternity = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const maternity = await Maternity.findByIdAndDelete(req.params.id);
//     if (!maternity) {
//       res.status(404).json({ success: false, message: 'Maternity record not found' });
//       return;
//     }
//     res.status(200).json({ success: true, data: {} });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };









import { Response } from 'express';
import Maternity, { MATERNITY_PACKAGES } from '../models/Maternity';
import { User } from '../models/User';
import { googleCalendarService } from '../services/googleCalendarService';
import { AuthRequest } from '../middleware/authenticate';

// ─── Get all package options (for frontend dropdowns) ──────────────────────────
export const getPackages = (_req: AuthRequest, res: Response): void => {
  const packages = Object.entries(MATERNITY_PACKAGES).map(([name, price]) => ({
    name,
    price,
  }));
  res.status(200).json({ success: true, data: packages });
};

// ─── Create a new Maternity record ────────────────────────────────────────────
// Minimum required: clientName, phoneNumber
// Everything else (total, balance, advance) is auto-calculated.
// Example body:
// {
//   "clientName": "Priya Shah",
//   "phoneNumber": "9876543210",
//   "package": "Standard",
//   "extras": [{ "description": "Drone shots", "amount": 2000 }],
//   "payments": [{ "amount": 4000, "note": "UPI advance" }]
// }
export const createMaternity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maternity = new Maternity(req.body);
    await maternity.save(); // triggers pre-save calculations

    // Google Calendar Sync
    if (maternity.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent({
          summary: `Maternity Shoot: ${maternity.clientName}`,
          description: `Package: ${maternity.package || 'N/A'}\nPhone: ${maternity.phoneNumber}\nNotes: ${maternity.notes || ''}`,
          start: maternity.shootDateAndTime,
          end: new Date(maternity.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
        }, user.googleRefreshToken);
        
        if (eventId) {
          maternity.googleCalendarEventId = eventId;
          await maternity.save();
        }
      }
    }

    res.status(201).json({ success: true, data: maternity });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get all Maternity records ─────────────────────────────────────────────────
// Optional query params:
//   ?status=Pending         → filter by status
//   ?balance=due            → only show records with balance > 0 (money pending)
export const getMaternities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, any> = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.balance === 'due') {
      filter.balance = { $gt: 0 }; // client still owes money
    }
    if (req.query.balance === 'clear') {
      filter.balance = { $lte: 0 }; // fully paid
    }

    const maternities = await Maternity.find(filter).sort({ createdAt: -1 });

    // Attach a summary to the response for quick overview
    const summary = {
      total:       maternities.length,
      totalRevenue: maternities.reduce((sum, m) => sum + m.total, 0),
      totalReceived: maternities.reduce((sum, m) => sum + m.advance, 0),
      totalDue:    maternities.reduce((sum, m) => sum + Math.max(m.balance, 0), 0),
    };

    res.status(200).json({ success: true, summary, data: maternities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get a single Maternity record ────────────────────────────────────────────
export const getMaternityById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maternity = await Maternity.findById(req.params.id);
    if (!maternity) {
      res.status(404).json({ success: false, message: 'Maternity record not found' });
      return;
    }
    res.status(200).json({ success: true, data: maternity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update a Maternity record ────────────────────────────────────────────────
// Recalculates everything automatically.
// You can update package, extras, or payments and totals will self-correct.
export const updateMaternity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // We use findById + save() so the pre-save hook runs for recalculation
    const maternity = await Maternity.findById(req.params.id);
    if (!maternity) {
      res.status(404).json({ success: false, message: 'Maternity record not found' });
      return;
    }

    // Apply only the fields sent in the request
    Object.assign(maternity, req.body);
    await maternity.save(); // triggers pre-save recalculation

    // Google Calendar Sync
    if (maternity.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        const eventId = await googleCalendarService.upsertEvent({
          id: maternity.googleCalendarEventId,
          summary: `Maternity Shoot: ${maternity.clientName}`,
          description: `Package: ${maternity.package || 'N/A'}\nPhone: ${maternity.phoneNumber}\nNotes: ${maternity.notes || ''}`,
          start: maternity.shootDateAndTime,
          end: new Date(maternity.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
        }, user.googleRefreshToken);

        if (eventId && eventId !== maternity.googleCalendarEventId) {
          maternity.googleCalendarEventId = eventId;
          await maternity.save();
        }
      }
    }

    res.status(200).json({ success: true, data: maternity });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Add a Payment ────────────────────────────────────────────────────────────
// Dedicated endpoint to add a payment without touching other fields.
// Body: { "amount": 3000, "note": "Cash payment" }
export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
      return;
    }

    const maternity = await Maternity.findById(req.params.id);
    if (!maternity) {
      res.status(404).json({ success: false, message: 'Maternity record not found' });
      return;
    }

    if (maternity.status === 'Cancelled') {
      res.status(400).json({ success: false, message: 'Cannot add payment to a cancelled record' });
      return;
    }

    // Push new payment — pre-save will recalculate advance and balance
    maternity.payments.push({ amount, date: new Date(), note });
    await maternity.save();

    // Google Calendar Sync (Description might contain payment info)
    if (maternity.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        await googleCalendarService.upsertEvent({
          id: maternity.googleCalendarEventId,
          summary: `Maternity Shoot: ${maternity.clientName}`,
          description: `Package: ${maternity.package || 'N/A'}\nPhone: ${maternity.phoneNumber}\nNotes: ${maternity.notes || ''}`,
          start: maternity.shootDateAndTime,
          end: new Date(maternity.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
        }, user.googleRefreshToken);
      }
    }

    res.status(200).json({
      success: true,
      message: `Payment of ₹${amount} recorded. Balance remaining: ₹${maternity.balance}`,
      data: maternity,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Add an Extra ─────────────────────────────────────────────────────────────
// Dedicated endpoint to add an extra item without touching other fields.
// Body: { "description": "Maternity album", "amount": 2500 }
export const addExtra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { description, amount } = req.body;

    if (!description || !amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Extra description and amount are required' });
      return;
    }

    const maternity = await Maternity.findById(req.params.id);
    if (!maternity) {
      res.status(404).json({ success: false, message: 'Maternity record not found' });
      return;
    }

    // Push new extra — pre-save will recalculate extrasTotal and total
    maternity.extras.push({ description, amount });
    await maternity.save();

    // Google Calendar Sync
    if (maternity.shootDateAndTime && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        await googleCalendarService.upsertEvent({
          id: maternity.googleCalendarEventId,
          summary: `Maternity Shoot: ${maternity.clientName}`,
          description: `Package: ${maternity.package || 'N/A'}\nPhone: ${maternity.phoneNumber}\nNotes: ${maternity.notes || ''}`,
          start: maternity.shootDateAndTime,
          end: new Date(maternity.shootDateAndTime.getTime() + 2 * 60 * 60 * 1000),
        }, user.googleRefreshToken);
      }
    }

    res.status(200).json({
      success: true,
      message: `Extra "${description}" of ₹${amount} added. New total: ₹${maternity.total}`,
      data: maternity,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get Financial Summary for a Record ───────────────────────────────────────
// Returns a clean breakdown: what was charged, what was paid, what's pending.
export const getFinancialSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maternity = await Maternity.findById(req.params.id);
    if (!maternity) {
      res.status(404).json({ success: false, message: 'Maternity record not found' });
      return;
    }

    const summary = {
      client:       maternity.clientName,
      package:      maternity.package ?? 'No package selected',
      packagePrice: maternity.packagePrice,
      extras:       maternity.extras,           // itemized list
      extrasTotal:  maternity.extrasTotal,
      expenses:     maternity.expenses,         // your internal cost
      total:        maternity.total,            // what client owes
      payments:     maternity.payments,         // itemized payment history
      advance:      maternity.advance,          // total received
      balance:      maternity.balance,          // still pending (positive = due, negative = overpaid)
      status:       maternity.status,
      isPaid:       maternity.balance <= 0,
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete a Maternity record ────────────────────────────────────────────────
export const deleteMaternity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const maternity = await Maternity.findById(req.params.id);
    if (!maternity) {
      res.status(404).json({ success: false, message: 'Maternity record not found' });
      return;
    }

    if (maternity.googleCalendarEventId && req.user) {
      const user = await User.findById(req.user.id).select('+googleRefreshToken');
      if (user?.googleRefreshToken) {
        await googleCalendarService.deleteEvent(maternity.googleCalendarEventId, user.googleRefreshToken);
      }
    }

    await Maternity.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};