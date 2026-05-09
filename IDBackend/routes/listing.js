import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import Listing from '../models/Listing.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern-images', 
    allowed_formats: ['jpg', 'jpeg', 'png'], 
  },
});

const upload = multer({ storage });

router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, category, subcategory, price, instagramUrl, size, religions, seoTitle, seoDescription, seoKeywords } = req.body;

    const imageUrls = req.files.map(file => file.path); 

    const newListing = new Listing({
      title,
      category,
      subcategory,
      price,
      instagramUrl,
      size,
      religions,
      seoTitle,
      seoDescription,
      seoKeywords,
      images: imageUrls,
    });

    await newListing.save();

    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
