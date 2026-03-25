import { Router } from 'express';
import {
  createEdit,
  getEdits,
  getEdit,
  updateEdit,
  deleteEdit,
  getEditStats,
} from '../controllers/editController';

const router = Router();

router.route('/').get(getEdits).post(createEdit);
router.get('/stats', getEditStats);
router.route('/:id').get(getEdit).patch(updateEdit).delete(deleteEdit);

export default router;
