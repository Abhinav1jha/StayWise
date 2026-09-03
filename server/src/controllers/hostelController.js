import mongoose from 'mongoose';
import Hostel from '../models/Hostel.js';
import { generateHostelInsights } from '../services/aiHostelInsightsService.js';

// Whitelisted sort options to prevent arbitrary MongoDB field injection
const SORT_OPTIONS = {
  newest: '-createdAt',
  oldest: 'createdAt',
  price_asc: 'pricing.monthlyRent',
  price_desc: '-pricing.monthlyRent',
  rating: '-ratings.overall',
  reviews: '-totalReviews',
};

// GET /api/hostels
export const getHostels = async (req, res, next) => {
  try {
    const {
      search,
      city, area, type, gender, availability,
      minRent, maxRent,
      amenities,
      minRating,
      minCleanliness, minFood, minSafety,
      sort = 'newest',
      page = 1, limit = 12,
    } = req.query;

    // Build filter
    const filter = {};

    // --- Keyword search (uses text index on name + description) ---
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // --- Location ---
    if (city) filter['location.city'] = city.toLowerCase().trim();
    if (area) filter['location.area'] = area.toLowerCase().trim();

    // --- Type & gender ---
    if (type && ['hostel', 'pg'].includes(type)) filter.type = type;
    if (gender && ['male', 'female', 'coed'].includes(gender)) filter.gender = gender;

    // --- Availability ---
    if (availability && ['available', 'limited', 'full'].includes(availability)) {
      filter['availability.status'] = availability;
    }

    // --- Price range ---
    if (minRent || maxRent) {
      filter['pricing.monthlyRent'] = {};
      const min = Number(minRent);
      const max = Number(maxRent);
      if (minRent && !isNaN(min) && min >= 0) filter['pricing.monthlyRent'].$gte = min;
      if (maxRent && !isNaN(max) && max >= 0) filter['pricing.monthlyRent'].$lte = max;
      // Remove empty object if both were invalid
      if (Object.keys(filter['pricing.monthlyRent']).length === 0) {
        delete filter['pricing.monthlyRent'];
      }
    }

    // --- Amenities (comma-separated, e.g. amenities=wifi,ac,laundry) ---
    if (amenities) {
      const list = amenities.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (list.length > 0) {
        filter.amenities = { $all: list };
      }
    }

    // --- Rating filters ---
    const parseRating = (val) => {
      const n = Number(val);
      return !isNaN(n) && n >= 0 && n <= 5 ? n : null;
    };
    if (minRating) {
      const v = parseRating(minRating);
      if (v !== null) filter['ratings.overall'] = { $gte: v };
    }
    if (minCleanliness) {
      const v = parseRating(minCleanliness);
      if (v !== null) filter['ratings.cleanliness'] = { $gte: v };
    }
    if (minFood) {
      const v = parseRating(minFood);
      if (v !== null) filter['ratings.food'] = { $gte: v };
    }
    if (minSafety) {
      const v = parseRating(minSafety);
      if (v !== null) filter['ratings.safety'] = { $gte: v };
    }

    // --- Sort (whitelisted) ---
    const sortField = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    // --- Pagination ---
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [hostels, total] = await Promise.all([
      Hostel.find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      Hostel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: hostels,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/hostels/:id
export const getHostel = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({ success: true, data: hostel });
  } catch (error) {
    next(error);
  }
};

// POST /api/hostels
export const createHostel = async (req, res, next) => {
  try {
    // Prevent client from injecting server-computed fields
    delete req.body.ratings;
    delete req.body.totalReviews;
    delete req.body.createdBy;

    const hostel = await Hostel.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: hostel });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

// PUT /api/hostels/:id
export const updateHostel = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Ownership check: creator or admin
    if (hostel.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hostel' });
    }

    // Prevent changing server-computed fields
    delete req.body.createdBy;
    delete req.body.ratings;
    delete req.body.totalReviews;

    const updated = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

// DELETE /api/hostels/:id
export const deleteHostel = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Ownership check: creator or admin
    if (hostel.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hostel' });
    }

    await hostel.deleteOne();
    res.json({ success: true, message: 'Hostel deleted' });
  } catch (error) {
    next(error);
  }
};

// GET /api/hostels/compare?ids=id1,id2,id3
export const compareHostels = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ success: false, message: 'Please provide hostel IDs via ?ids=id1,id2,...' });
    }

    const idList = ids.split(',').map((id) => id.trim()).filter(Boolean);

    if (idList.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide at least 2 hostel IDs to compare' });
    }
    if (idList.length > 3) {
      return res.status(400).json({ success: false, message: 'You can compare a maximum of 3 hostels' });
    }

    // Validate all IDs
    const invalid = idList.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid hostel ID(s): ${invalid.join(', ')}` });
    }

    // Fetch all in a single query
    const hostels = await Hostel.find({ _id: { $in: idList } })
      .populate('createdBy', 'name email');

    // Check if all requested hostels were found
    if (hostels.length !== idList.length) {
      const foundIds = hostels.map((h) => h._id.toString());
      const notFound = idList.filter((id) => !foundIds.includes(id));
      return res.status(404).json({ success: false, message: `Hostel(s) not found: ${notFound.join(', ')}` });
    }

    // Return in the requested order
    const ordered = idList.map((id) => hostels.find((h) => h._id.toString() === id));

    res.json({ success: true, data: ordered });
  } catch (error) {
    next(error);
  }
};

// GET /api/hostels/:hostelId/ai-insights
export const getHostelInsights = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    let insights;
    try {
      insights = await generateHostelInsights(hostelId);
    } catch (aiError) {
      console.error('Hostel insights AI error:', aiError.message);
      return res.status(503).json({
        success: false,
        message: 'AI insights service is temporarily unavailable',
      });
    }

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'No analyzed reviews available for this hostel',
      });
    }

    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};
