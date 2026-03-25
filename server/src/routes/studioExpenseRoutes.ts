import express from 'express';
import {
  createStudioExpense,
  getStudioExpenses,
  updateStudioExpense,
  deleteStudioExpense,
} from '../controllers/studioExpenseController';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

router.use(authenticate);

router.post('/', createStudioExpense);
router.get('/', getStudioExpenses);
router.put('/:id', updateStudioExpense);
router.delete('/:id', deleteStudioExpense);

export default router;
