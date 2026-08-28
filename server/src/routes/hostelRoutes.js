import { Router } from 'express';
import {
  getHostels,
  getHostel,
  createHostel,
  updateHostel,
  deleteHostel,
  compareHostels,
  getHostelInsights,
} from '../controllers/hostelController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.route('/')
  .get(getHostels)
  .post(protect, createHostel);

router.get('/compare', compareHostels);
router.get('/:hostelId/ai-insights', getHostelInsights);

router.route('/:id')
  .get(getHostel)
  .put(protect, updateHostel)
  .delete(protect, deleteHostel);

export default router;
