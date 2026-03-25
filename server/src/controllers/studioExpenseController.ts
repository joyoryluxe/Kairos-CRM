import { Response } from 'express';
import StudioExpense from '../models/StudioExpense';
import { AuthRequest } from '../middleware/authenticate';

// ─── Create ───────────────────────────────────────────────────────────────────
export const createStudioExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await StudioExpense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get All ──────────────────────────────────────────────────────────────────
export const getStudioExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, category } = req.query;
    let query: any = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    if (category) {
      query.category = category;
    }

    const expenses = await StudioExpense.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ───────────────────────────────────────────────────────────────────
export const updateStudioExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await StudioExpense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
export const deleteStudioExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await StudioExpense.findByIdAndDelete(req.params.id);
    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
