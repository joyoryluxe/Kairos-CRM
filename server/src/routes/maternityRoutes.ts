import { Router } from 'express';
import {
  createMaternity,
  getMaternities,
  getMaternityById,
  updateMaternity,
  deleteMaternity,
} from '../controllers/maternityController';
// Optional: If you want these protected, import a protect/requireAuth middleware
// import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Routes for /api/maternity
router.route('/').post(createMaternity).get(getMaternities);
router.route('/:id').get(getMaternityById).put(updateMaternity).delete(deleteMaternity);

export default router;
