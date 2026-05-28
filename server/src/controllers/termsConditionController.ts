import { Response } from 'express';
import TermsCondition from '../models/TermsCondition';
import { AuthRequest } from '../middleware/authenticate';

// Save (Upsert) terms list for a category
export const saveTermsCondition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, terms } = req.body;
    
    if (!category) {
      res.status(400).json({ success: false, message: 'Category is required' });
      return;
    }

    const doc = await TermsCondition.findOneAndUpdate(
      { user: req.user?.id, category: category.trim() },
      { terms: terms || [] },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all terms lists scoped to user
export const getTermsConditions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const docs = await TermsCondition.find({ user: req.user?.id }).sort({ category: 1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single terms list by database ID
export const getTermsConditionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await TermsCondition.findOne({ _id: req.params.id, user: req.user?.id });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Terms list not found' });
      return;
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete terms list for a category by ID
export const deleteTermsCondition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await TermsCondition.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Terms list not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
