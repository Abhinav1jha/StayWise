import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';
import recalculateHostelRatings from '../utils/recalculateHostelRatings.js';
import { analyzeReview as aiAnalyze } from '../services/aiReviewService.js';

// POST /api/hostels/:hostelId/reviews
export const createReview = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    // Verify hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ user: req.user._id, hostel: hostelId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this hostel' });
    }

    const { ratings, text } = req.body;

    const review = await Review.create({
      ratings,
      text,
      user: req.user._id,
      hostel: hostelId,
    });

    // Populate user name for the response
    await review.populate('user', 'name');

    // Recalculate hostel ratings
    await recalculateHostelRatings(review.hostel);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    // Handle duplicate key error (race condition fallback)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this hostel' });
    }
    next(error);
  }
};

// GET /api/hostels/:hostelId/reviews
export const getHostelReviews = async (req, res, next) => {
  try {
    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hostel ID' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { hostel: hostelId };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name'),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reviews,
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

// GET /api/reviews/my
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('hostel', 'name type location.city pricing.monthlyRent');

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reviews/:id
export const updateReview = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only the review owner can update
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    // Prevent changing server-controlled fields
    delete req.body.user;
    delete req.body.hostel;
    delete req.body.aiAnalysis;

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'name');

    // Recalculate hostel ratings
    await recalculateHostelRatings(review.hostel);

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only the review owner can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const hostelId = review.hostel;
    await review.deleteOne();

    // Recalculate hostel ratings
    await recalculateHostelRatings(hostelId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews/:id/analyze
export const analyzeReviewAI = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only review owner or admin can request analysis
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to analyze this review' });
    }

    // Call AI service
    let analysis;
    try {
      analysis = await aiAnalyze(review.text);
    } catch (aiError) {
      console.error('AI analysis error:', aiError.message);
      return res.status(503).json({
        success: false,
        message: 'AI analysis service is temporarily unavailable',
      });
    }

    // Save atomically — don't partially overwrite
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { aiAnalysis: analysis } },
      { new: true }
    ).populate('user', 'name');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
