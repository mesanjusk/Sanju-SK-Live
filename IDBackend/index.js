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
import googleDriveRoutes from './routes/googleDriveRoutes.js';
import autoReplyRoutes from './routes/autoReplyRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import inboxRoutes from './routes/inboxRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import {verifyToken} from './utils/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in environment.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '20mb', verify(req,_res,buffer){
  if(req.originalUrl.startsWith('/api/orders/webhook'))req.rawBody=Buffer.from(buffer);
} }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Enforce admin permissions server-side. Public catalog and lead submissions remain accessible.
const guardedWrites=[
  ['/api/listings','canManageProducts'],['/api/images','canManageProducts'],
  ['/api/categories','canManageCategories'],['/api/subcategories','canManageCategories'],
  ['/api/banners','canManageBanners'],['/api/videos','canManageProducts'],
  ['/api/titles','canManageProducts'],['/api/prices','canManageProducts'],
  ['/api/religions','canManageProducts'],['/api/confi','canManageSettings'],
  ['/api/instas','canManageProducts']
];
function requireRole(req,res,next,permission){
  verifyToken(req,res,()=>{
    if(req.user?.role==='admin' || (req.user?.permissions?.[permission]===true)){
      next();return;
    }
    res.status(403).json({message:'Not authorized for this action.'});
  });
}
app.use((req,res,next)=>{
  if(req.method==='OPTIONS')return next();
  const pathname=req.path.toLowerCase();
  if(pathname==='/api/users/login')return next();
  if(pathname.startsWith('/api/users'))
    return requireRole(req,res,next,'canManageUsers');
  if(pathname.startsWith('/api/google-drive')||pathname.startsWith('/api/inbox')||
     pathname.startsWith('/api/auto-reply'))
    return requireRole(req,res,next,'canManageWhatsApp');
  if((pathname.startsWith('/api/leads') && req.method!=='POST') ||
     (pathname.startsWith('/api/leads/') && req.method==='POST'))
    return requireRole(req,res,next,'canManageLeads');
  if(pathname==='/api/analytics/summary' || pathname==='/api/analytics/insights')
    return requireRole(req,res,next,'canViewAnalytics');
  if(!['GET','HEAD'].includes(req.method)){
    const found=guardedWrites.find(([prefix])=>pathname.startsWith(prefix));
    if(found)return requireRole(req,res,next,found[1]);
  }
  next();
});

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
app.use('/api/videos', videoRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/ping', (req, res) => res.status(200).send('✅ Backend is alive!'));

// Catch any unhandled promise rejections so they don't silently crash the process
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('✅ Routes registered: leads, inbox, confi/effective-wa-number, webhook');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on 0.0.0.0:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
