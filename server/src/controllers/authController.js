import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: { user, token }, // password stripped by toJSON transform
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

// GET /api/auth/preferences
export const getPreferences = async (req, res) => {
  res.json({
    success: true,
    data: { preferences: req.user.preferences },
  });
};

// PUT /api/auth/preferences
export const updatePreferences = async (req, res, next) => {
  try {
    const allowedFields = [
      'budgetPriority', 'cleanlinessPriority', 'locationPriority',
      'foodPriority', 'safetyPriority', 'maxBudget',
    ];

    const updates = {};
    const errors = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const value = Number(req.body[field]);

        if (isNaN(value)) {
          errors.push(`${field} must be a number`);
          continue;
        }

        if (field === 'maxBudget') {
          if (value < 0) {
            errors.push('maxBudget must be >= 0');
            continue;
          }
        } else {
          if (value < 0 || value > 10) {
            errors.push(`${field} must be between 0 and 10`);
            continue;
          }
        }

        updates[`preferences.${field}`] = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join('. ') });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid preference fields provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
};
