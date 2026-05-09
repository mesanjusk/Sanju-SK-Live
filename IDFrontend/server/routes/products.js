import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Fetch all products with optional search, category, and sorting
router.get('/', async (req, res) => {
  const { search, category, sort } = req.query;
  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  let products = await Product.find(query);
  if (sort === 'price-asc') products = products.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products = products.sort((a, b) => b.price - a.price);
  res.json(products);
});

// Fetch single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Admin: add product
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

// Admin: update product
router.put('/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

// Admin: delete product
router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
