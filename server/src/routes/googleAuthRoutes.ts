import { Router } from 'express';
import { getGoogleAuthUrl, googleAuthCallback, syncAll } from '../controllers/googleAuthController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Callback must be public for Google to contact us
router.get('/callback', googleAuthCallback);

// Only authenticated users can generate an auth URL (to link it to their ID)
router.get('/url', authenticate, getGoogleAuthUrl); 

// Manual sync all records
router.post('/sync-all', authenticate, syncAll);

export default router;
