import { Router } from 'express';
import { getFieldSuggestions } from '../controllers/suggestionController';

const router = Router();

router.get('/:model/:field', getFieldSuggestions);

export default router;
