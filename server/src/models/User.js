import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // excluded from queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      // Weights for personalized hostel recommendations (0–10 scale)
      // Extensible: add new criteria as needed without migration
      budgetPriority: { type: Number, min: 0, max: 10, default: 5 },
      cleanlinessPriority: { type: Number, min: 0, max: 10, default: 5 },
      locationPriority: { type: Number, min: 0, max: 10, default: 5 },
      foodPriority: { type: Number, min: 0, max: 10, default: 5 },
      safetyPriority: { type: Number, min: 0, max: 10, default: 5 },
      // Preferred maximum monthly rent for budget-aware recommendations
      maxBudget: { type: Number, min: 0, default: 10000 },
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// --- Password Hashing ---
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// --- Password Verification ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// --- JSON Transform ---
// Strip password and __v from all JSON/object output
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;

