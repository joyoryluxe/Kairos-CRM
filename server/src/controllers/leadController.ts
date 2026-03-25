import mongoose from 'mongoose';
import { Response } from 'express';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/authenticate';

// ─── Create Lead ──────────────────────────────────────────────────────────────
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.create({
      ...req.body,
      user: req.user?.id,
    });
    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get All Leads (Scoped to User) ───────────────────────────────────────────
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leads = await Lead.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Lead ──────────────────────────────────────────────────────────
export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.user?.id });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Lead ──────────────────────────────────────────────────────────────
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete Lead ──────────────────────────────────────────────────────────────
export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Lead Stats (for dashboard) ───────────────────────────────────────────────
export const getLeadStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const stats = await Lead.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const sourceStats = await Lead.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        sourceStats: sourceStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
