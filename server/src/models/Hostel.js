import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
  {
    // --- Basic Information ---
    name: {
      type: String,
      required: [true, 'Hostel name is required'],
      trim: true,
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    type: {
      type: String,
      enum: ['hostel', 'pg'],
      required: [true, 'Type is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },

    // --- Location ---
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        lowercase: true,
      },
      area: {
        type: String,
        trim: true,
        lowercase: true,
      },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },

    // --- Pricing ---
    pricing: {
      monthlyRent: {
        type: Number,
        required: [true, 'Monthly rent is required'],
        min: [0, 'Rent cannot be negative'],
      },
      securityDeposit: {
        type: Number,
        default: 0,
        min: [0, 'Deposit cannot be negative'],
      },
    },

    // --- Property Details ---
    roomTypes: [
      {
        name: { type: String, trim: true },           // e.g. "Single", "Double", "Triple"
        occupancy: { type: Number, min: 1 },           // beds per room
        price: { type: Number, min: 0 },               // per-room-type price if different
        _id: false,
      },
    ],
    gender: {
      type: String,
      enum: ['male', 'female', 'coed'],
      default: 'coed',
    },
    amenities: [{ type: String, trim: true, lowercase: true }], // e.g. ["wifi", "ac", "laundry"]
    images: [{ type: String }], // URLs

    // --- Category Ratings (aggregated from reviews) ---
    // These start at 0 and will be recalculated when reviews are submitted.
    ratings: {
      cleanliness: { type: Number, min: 0, max: 5, default: 0 },
      food: { type: Number, min: 0, max: 5, default: 0 },
      location: { type: Number, min: 0, max: 5, default: 0 },
      safety: { type: Number, min: 0, max: 5, default: 0 },
      staff: { type: Number, min: 0, max: 5, default: 0 },
      valueForMoney: { type: Number, min: 0, max: 5, default: 0 },
      overall: { type: Number, min: 0, max: 5, default: 0 },
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --- Availability ---
    availability: {
      status: {
        type: String,
        enum: ['available', 'limited', 'full'],
        default: 'available',
      },
      bedsAvailable: { type: Number, min: 0, default: 0 },
    },

    // --- Ownership ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes for search & filter ---
hostelSchema.index({ 'location.city': 1, type: 1 });          // city + type filter
hostelSchema.index({ 'pricing.monthlyRent': 1 });             // price sort/range
hostelSchema.index({ gender: 1 });                             // gender filter
hostelSchema.index({ 'ratings.overall': -1 });                 // top-rated sort
hostelSchema.index({ 'availability.status': 1 });             // availability filter
hostelSchema.index({ name: 'text', description: 'text' });    // text search

// --- JSON Transform ---
hostelSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Hostel = mongoose.model('Hostel', hostelSchema);

export default Hostel;
