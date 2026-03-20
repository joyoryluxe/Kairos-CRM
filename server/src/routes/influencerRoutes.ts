import { Router } from 'express';
import {
  createInfluencer,
  getInfluencers,
  getInfluencerById,
  updateInfluencer,
  deleteInfluencer,
} from '../controllers/influencerController';

const router = Router();

// Routes for /api/influencer
router.route('/').post(createInfluencer).get(getInfluencers);
router.route('/:id').get(getInfluencerById).put(updateInfluencer).delete(deleteInfluencer);

export default router;
