import Hostel from '../models/Hostel.js';
import { scoreHostels } from '../utils/recommendationEngine.js';

// GET /api/recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const { city, type, gender, minRent, maxRent, limit = 20 } = req.query;

    // Build base filter (reuse same patterns as hostel search)
    const filter = {};
    if (city) filter['location.city'] = city.toLowerCase().trim();
    if (type && ['hostel', 'pg'].includes(type)) filter.type = type;
    if (gender && ['male', 'female', 'coed'].includes(gender)) filter.gender = gender;
    if (minRent || maxRent) {
      filter['pricing.monthlyRent'] = {};
      const min = Number(minRent);
      const max = Number(maxRent);
      if (minRent && !isNaN(min) && min >= 0) filter['pricing.monthlyRent'].$gte = min;
      if (maxRent && !isNaN(max) && max >= 0) filter['pricing.monthlyRent'].$lte = max;
      if (Object.keys(filter['pricing.monthlyRent']).length === 0) {
        delete filter['pricing.monthlyRent'];
      }
    }

    // Fetch candidate hostels (available/limited only by default)
    if (!filter['availability.status']) {
      filter['availability.status'] = { $in: ['available', 'limited'] };
    }

    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    const hostels = await Hostel.find(filter)
      .populate('createdBy', 'name email');

    // Score using authenticated user's preferences
    const recommendations = scoreHostels(hostels, req.user.preferences || {});

    // Return top N
    const topN = recommendations.slice(0, limitNum);

    res.json({
      success: true,
      data: topN,
      total: recommendations.length,
    });
  } catch (error) {
    next(error);
  }
};
