import { Response } from 'express';
import mongoose from 'mongoose';
import Edit from '../models/Edit';
import { AuthRequest } from '../middleware/authenticate';
import { sanitizeCommonBody } from '../utils/sanitizer';

// ─── Create Edit ──────────────────────────────────────────────────────────────
export const createEdit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    sanitizeCommonBody(
      req.body,
      ['receivedDate', 'deadline'],
      ['status', 'priority', 'package'],
      ['extras', 'payments']
    );

    const edit = await Edit.create({
      ...req.body,
      user: req.user?.id,
    });
    res.status(201).json({ success: true, data: edit });
  } catch (error: any) {
    console.error("Error creating edit task:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get All Edits (Scoped to User) ───────────────────────────────────────────
export const getEdits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      clientName,
      status,
      priority,
      type,
      dateFrom,
      dateTo,
      receivedDateStart,
      receivedDateEnd,
      deadlineStart,
      deadlineEnd,
    } = req.query;

    const filter: any = { user: req.user?.id };

    if (clientName) filter.clientName = { $regex: clientName, $options: 'i' };
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (type && type !== 'All') filter.type = { $regex: type, $options: 'i' };

    if (receivedDateStart || receivedDateEnd) {
      filter.receivedDate = {};
      if (receivedDateStart) filter.receivedDate.$gte = new Date(receivedDateStart as string);
      if (receivedDateEnd) filter.receivedDate.$lte = new Date(receivedDateEnd as string);
    }

    if (deadlineStart || deadlineEnd) {
      filter.deadline = {};
      if (deadlineStart) filter.deadline.$gte = new Date(deadlineStart as string);
      if (deadlineEnd) filter.deadline.$lte = new Date(deadlineEnd as string);
    }

    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(dateFrom as string) : new Date(0);
      const end = dateTo ? new Date(dateTo as string) : new Date(8640000000000000);

      filter.$or = [
        { receivedDate: { $gte: start, $lte: end } },
        { "payments.date": { $gte: start, $lte: end } }
      ];
    }

    const edits = await Edit.find(filter).sort({ deadline: 1 });

    // Summary calculation based on FILTERED data
    let summary;
    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(dateFrom as string) : new Date(0);
      const end = dateTo ? new Date(dateTo as string) : new Date(8640000000000000);

      // Filter records to count for received-based fields (totalRecords, totalRevenue, totalExpenses, totalDue, totalProfit)
      const shootMatched = edits.filter(e => {
        if (!e.receivedDate) return false;
        const shootDate = new Date(e.receivedDate);
        return shootDate >= start && shootDate <= end;
      });

      // Calculate received amount from payments falling in the range
      let totalReceived = 0;
      edits.forEach(e => {
        if (Array.isArray(e.payments)) {
          e.payments.forEach(p => {
            if (p.date) {
              const pDate = new Date(p.date);
              if (pDate >= start && pDate <= end) {
                totalReceived += (p.amount || 0);
              }
            }
          });
        }
      });

      summary = {
        totalRecords: shootMatched.length,
        totalRevenue: shootMatched.reduce((sum, e) => sum + (e.total || 0), 0),
        totalReceived,
        totalDue: shootMatched.reduce((sum, e) => sum + Math.max(e.balance || 0, 0), 0),
        totalExpenses: shootMatched.reduce((sum, e) => sum + (e.expenses || 0), 0),
        totalProfit: shootMatched.reduce((sum, e) => sum + (e.profit || 0), 0),
      };
    } else {
      // No date filter active, use full values
      summary = {
        totalRecords: edits.length,
        totalRevenue: edits.reduce((sum, e) => sum + (e.total || 0), 0),
        totalReceived: edits.reduce((sum, e) => sum + (e.advance || 0), 0),
        totalDue: edits.reduce((sum, e) => sum + Math.max(e.balance || 0, 0), 0),
        totalExpenses: edits.reduce((sum, e) => sum + (e.expenses || 0), 0),
        totalProfit: edits.reduce((sum, e) => sum + (e.profit || 0), 0),
      };
    }

    res.status(200).json({ success: true, count: edits.length, summary, data: edits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Edit ──────────────────────────────────────────────────────────
export const getEdit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const edit = await Edit.findOne({ _id: req.params.id, user: req.user?.id });
    if (!edit) {
      res.status(404).json({ success: false, message: 'Edit not found' });
      return;
    }
    res.status(200).json({ success: true, data: edit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Edit ──────────────────────────────────────────────────────────────
export const updateEdit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    sanitizeCommonBody(
      req.body,
      ['receivedDate', 'deadline'],
      ['status', 'priority', 'package'],
      ['extras', 'payments']
    );

    const edit = await Edit.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!edit) {
      res.status(404).json({ success: false, message: 'Edit not found' });
      return;
    }
    res.status(200).json({ success: true, data: edit });
  } catch (error: any) {
    console.error("Error updating edit task:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete Edit ──────────────────────────────────────────────────────────────
export const deleteEdit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const edit = await Edit.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!edit) {
      res.status(404).json({ success: false, message: 'Edit not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Edit Stats (for dashboard) ───────────────────────────────────────────────
export const getEditStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await Edit.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user?.id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
