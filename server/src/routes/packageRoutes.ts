import { Router } from 'express';
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} from '../controllers/packageController';

const router = Router();

// Routes for /api/packages
router.route('/').get(getPackages).post(createPackage);
router.route('/:id').get(getPackageById).put(updatePackage).delete(deletePackage);

export default router;
