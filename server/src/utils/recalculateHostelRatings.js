import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';

/**
 * Recalculate and update a hostel's aggregated ratings from its reviews.
 * Uses MongoDB aggregation pipeline for efficient database-side computation.
 *
 * @param {import('mongoose').Types.ObjectId|string} hostelId
 */
const recalculateHostelRatings = async (hostelId) => {
  // Ensure hostelId is a proper ObjectId for the aggregation pipeline
  if (!mongoose.Types.ObjectId.isValid(hostelId)) {
    throw new Error(`Invalid hostel ID for rating recalculation: ${hostelId}`);
  }
  const objectId = new mongoose.Types.ObjectId(hostelId);

  const result = await Review.aggregate([
    { $match: { hostel: objectId } },
    {
      $group: {
        _id: '$hostel',
        totalReviews: { $sum: 1 },
        cleanliness: { $avg: '$ratings.cleanliness' },
        food: { $avg: '$ratings.food' },
        location: { $avg: '$ratings.location' },
        safety: { $avg: '$ratings.safety' },
        staff: { $avg: '$ratings.staff' },
        valueForMoney: { $avg: '$ratings.valueForMoney' },
        overall: { $avg: '$ratings.overall' },
      },
    },
  ]);

  const round = (val) => Math.round(val * 10) / 10; // 1 decimal place

  if (result.length > 0) {
    const stats = result[0];
    await Hostel.findByIdAndUpdate(hostelId, {
      ratings: {
        cleanliness: round(stats.cleanliness),
        food: round(stats.food),
        location: round(stats.location),
        safety: round(stats.safety),
        staff: round(stats.staff),
        valueForMoney: round(stats.valueForMoney),
        overall: round(stats.overall),
      },
      totalReviews: stats.totalReviews,
    });
  } else {
    // No reviews — reset to defaults
    await Hostel.findByIdAndUpdate(hostelId, {
      ratings: {
        cleanliness: 0,
        food: 0,
        location: 0,
        safety: 0,
        staff: 0,
        valueForMoney: 0,
        overall: 0,
      },
      totalReviews: 0,
    });
  }
};

export default recalculateHostelRatings;
