import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import Listing from '../models/Listing.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sk-listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({ storage });

router.post('/', upload.array('images', 4), async (req, res) => {
  try {
    const {
      title, description, category, subcategory, price, religions, size,
      badge, youtubeUrl, instagramUrl, seoTitle, seoDescription, seoKeywords,
      favorite, quantityPricing, existingImages,
    } = req.body;

    const uploadedUrls = req.files.map(f => f.path);
    const existingUrls = existingImages ? JSON.parse(existingImages) : [];
    const images = [...existingUrls, ...uploadedUrls].slice(0, 4);

    const newListing = new Listing({
      title, description, category, subcategory,
      price: Number(price) || 0,
      religions, size, badge, youtubeUrl, instagramUrl,
      seoTitle, seoDescription, seoKeywords, favorite,
      images,
      quantityPricing: quantityPricing ? JSON.parse(quantityPricing) : [],
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, religion, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (religion) filter.religions = religion;
    if (search) filter.title = { $regex: search, $options: 'i' };

    let query = Listing.find(filter);
    if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const listings = await query;
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', upload.array('images', 4), async (req, res) => {
  try {
    const {
      title, description, category, subcategory, price, religions, size,
      badge, youtubeUrl, instagramUrl, seoTitle, seoDescription, seoKeywords,
      favorite, quantityPricing, existingImages,
    } = req.body;

    const uploadedUrls = req.files.map(f => f.path);
    const existingUrls = existingImages ? JSON.parse(existingImages) : [];
    const images = [...existingUrls, ...uploadedUrls].slice(0, 4);

    const update = {
      title, description, category, subcategory,
      price: Number(price) || 0,
      religions, size, badge, youtubeUrl, instagramUrl,
      seoTitle, seoDescription, seoKeywords, favorite, images,
      quantityPricing: quantityPricing ? JSON.parse(quantityPricing) : [],
    };

    const listing = await Listing.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
