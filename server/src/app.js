import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';

const app = express();

// --------------- Global Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Routes --------------------------
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users/favorites', favoriteRoutes);

// --------------- Health Check --------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'StayWise API is running' });
});

// --------------- 404 Handler ---------------------
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --------------- Global Error Handler ------------
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

export default app;
