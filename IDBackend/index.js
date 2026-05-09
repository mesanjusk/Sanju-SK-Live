import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import imageRoutes from './routes/imageRoutes.js';
import listingRoutes from './routes/listing.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import titleRoutes from './routes/titleRoutes.js';
import instaUrlRoutes from './routes/instaUrlRouter.js';
import priceRoutes from './routes/priceRouter.js';
import userRoutes from './routes/userRoutes.js';
import confiRoutes from './routes/confiRoutes.js';
import religionRoutes from './routes/religionRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in environment.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.use('/api/images', imageRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/instas', instaUrlRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/confi', confiRoutes);
app.use('/api/religions', religionRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/ping', (req, res) => res.status(200).send('✅ Backend is alive!'));

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
