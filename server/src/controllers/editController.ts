import { Response } from 'express';
import mongoose from 'mongoose';
import Edit from '../models/Edit';
import { AuthRequest } from '../middleware/authenticate';

// ─── Create Edit ──────────────────────────────────────────────────────────────
export const createEdit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
    const edits = await Edit.find({ user: req.user?.id }).sort({ deadline: 1 });
    res.status(200).json({ success: true, count: edits.length, data: edits });
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
    const userId = req.user?.id;
    const stats = await Edit.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
