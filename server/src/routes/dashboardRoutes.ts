import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protect all dashboard routes
router.use(authenticate);

router.get('/overview', getDashboardOverview);

export default router;
