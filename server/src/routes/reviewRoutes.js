import { Router } from 'express';
import {
  createReview,
  getHostelReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  analyzeReviewAI,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

// Hostel-scoped review routes
router.route('/hostels/:hostelId/reviews')
  .get(getHostelReviews)
  .post(protect, createReview);

// User's own reviews
router.get('/reviews/my', protect, getMyReviews);

// Single review operations
router.route('/reviews/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// AI review analysis
router.post('/reviews/:id/analyze', protect, analyzeReviewAI);

export default router;
