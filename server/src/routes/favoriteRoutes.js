import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.get('/', protect, getFavorites);
router.post('/:hostelId', protect, addFavorite);
router.delete('/:hostelId', protect, removeFavorite);

export default router;
