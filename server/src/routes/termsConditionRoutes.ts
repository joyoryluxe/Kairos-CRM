import { Router } from 'express';
import {
  saveTermsCondition,
  getTermsConditions,
  getTermsConditionById,
  deleteTermsCondition,
} from '../controllers/termsConditionController';

const router = Router();

// Routes for /api/terms-conditions
router.route('/')
  .get(getTermsConditions)
  .post(saveTermsCondition);

router.route('/:id')
  .get(getTermsConditionById)
  .delete(deleteTermsCondition);

export default router;
