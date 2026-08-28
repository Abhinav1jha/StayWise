import mongoose from 'mongoose';

const ratingField = {
  type: Number,
  required: [true, 'Rating is required'],
  min: [1, 'Rating must be at least 1'],
  max: [5, 'Rating must be at most 5'],
};

const reviewSchema = new mongoose.Schema(
  {
    // --- References ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Hostel reference is required'],
    },

    // --- Category Ratings (1–5) ---
    ratings: {
      cleanliness: { ...ratingField },
      food: { ...ratingField },
      location: { ...ratingField },
      safety: { ...ratingField },
      staff: { ...ratingField },
      valueForMoney: { ...ratingField },
      overall: { ...ratingField },
    },

    // --- Review Text ---
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [20, 'Review must be at least 20 characters'],
      maxlength: [3000, 'Review must be at most 3000 characters'],
    },

    // --- AI Analysis (populated later by AI module) ---
    aiAnalysis: {
      sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
      summary: { type: String, maxlength: 500 },
      aspects: [
        {
          topic: { type: String },
          sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
          _id: false,
        },
      ],
      analyzedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
reviewSchema.index({ hostel: 1, user: 1 }, { unique: true }); // one review per user per hostel
reviewSchema.index({ hostel: 1, createdAt: -1 });              // hostel reviews, newest first
reviewSchema.index({ user: 1, createdAt: -1 });                // user's review history

// --- JSON Transform ---
reviewSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
