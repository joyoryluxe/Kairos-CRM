import { Router } from 'express';
import { getFieldSuggestions, getRecordByField } from '../controllers/suggestionController';

const router = Router();

router.get('/:model/:field', getFieldSuggestions);
router.get('/:model/:field/record', getRecordByField);

export default router;
