import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

router.route('/')
  .post(createLead)
  .get(getLeads);

router.get('/stats', getLeadStats);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

export default router;
