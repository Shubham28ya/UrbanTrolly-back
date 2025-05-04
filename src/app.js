import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import passport from 'passport';
import './config/passport.js';
import { adminJs, router as adminRouter } from './admin/admin.config.js';

dotenv.config();

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://your-production-domain.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// AdminJS Route
app.use(adminJs.options.rootPath, adminRouter);
app.use('/api/auth', authRoutes);
app.use(passport.initialize());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Export the app
export default app;

