import { Router } from 'express';
import { register, login, getMe, getPreferences, updatePreferences } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.route('/preferences')
  .get(protect, getPreferences)
  .put(protect, updatePreferences);

export default router;
