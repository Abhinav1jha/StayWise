import mongoose from 'mongoose';
import User from '../models/User.js';
import Hostel from '../models/Hostel.js';

// GET /api/users/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'name type location pricing ratings totalReviews availability images');

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/favorites/:hostelId
export const addFavorite = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Atomic add — $addToSet prevents duplicates
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: hostelId } },
      { new: true }
    ).populate('favorites', 'name type location pricing ratings totalReviews availability images');

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/favorites/:hostelId
export const removeFavorite = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    // Atomic remove
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: hostelId } },
      { new: true }
    ).populate('favorites', 'name type location pricing ratings totalReviews availability images');

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};
