import { Response } from 'express';
import Package from '../models/Package';
import { AuthRequest } from '../middleware/authenticate';

// Get all packages (optional ?category= filter, optional ?activeOnly=true)
export const getPackages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.category) {
      if (req.query.category !== 'General') {
        filter.category = { $in: [req.query.category, 'General'] };
      } else {
        filter.category = 'General';
      }
    }
    if (req.query.activeOnly === 'true') filter.isActive = true;

    const packages = await Package.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single package by ID
export const getPackageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }
    res.status(200).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new package
export const createPackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a package
export const updatePackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }
    res.status(200).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a package
export const deletePackage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) {
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
