import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRoute from './routes/products.js';
import ordersRoute from './routes/orders.js';
import Product from './models/Product.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skcards';
mongoose.connect(MONGODB_URI);

app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);

app.get('/api/categories', async (_req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
