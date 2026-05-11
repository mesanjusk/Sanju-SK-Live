import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import Listing from './models/Listing.js';
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
import googleDriveRoutes from './routes/googleDriveRoutes.js';
import autoReplyRoutes from './routes/autoReplyRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import inboxRoutes from './routes/inboxRoutes.js';

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
app.use('/api/google-drive', googleDriveRoutes);
app.use('/api/auto-reply', autoReplyRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/inbox', inboxRoutes);

app.get('/api/ping', (req, res) => res.status(200).send('✅ Backend is alive!'));

// Catch any unhandled promise rejections so they don't silently crash the process
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});

async function backfillProductIds() {
  const listings = await Listing.find({ productId: { $in: ['', null, undefined] } })
    .sort({ createdAt: 1 }).lean();
  if (listings.length === 0) return;

  // Find the highest existing SK number to continue from
  const last = await Listing.findOne({ productId: { $nin: ['', null] } })
    .sort({ createdAt: -1 }).lean();
  let counter = last?.productId ? parseInt(last.productId.replace(/\D/g, '')) || 0 : 0;

  for (const l of listings) {
    counter += 1;
    await Listing.updateOne({ _id: l._id }, { $set: { productId: `SK${String(counter).padStart(4, '0')}` } });
  }
  console.log(`✅ Backfilled productId for ${listings.length} listings`);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await backfillProductIds();
    console.log('✅ Routes registered: leads, inbox, confi/effective-wa-number, webhook');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on 0.0.0.0:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
