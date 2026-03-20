import { Router } from 'express';
import {
  createCorporateEvent,
  getCorporateEvents,
  getCorporateEventById,
  updateCorporateEvent,
  deleteCorporateEvent,
} from '../controllers/corporateEventController';

const router = Router();

// Routes for /api/corporate-events
router.route('/').post(createCorporateEvent).get(getCorporateEvents);
router.route('/:id').get(getCorporateEventById).put(updateCorporateEvent).delete(deleteCorporateEvent);

export default router;
