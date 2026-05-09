import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import Banner from '../models/Banner.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sk-banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 700, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, altText, ctaUrl } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    const banner = new Banner({
      name,
      imageUrl: req.file.path,
      public_id: req.file.filename,
      altText,
      ctaUrl,
    });
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (banner?.public_id) {
      await cloudinary.uploader.destroy(banner.public_id).catch(() => {});
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, altText, ctaUrl } = req.body;
    const banner = await Banner.findByIdAndUpdate(req.params.id, { name, altText, ctaUrl }, { new: true });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
