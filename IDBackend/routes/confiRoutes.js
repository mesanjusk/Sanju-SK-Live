import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import Confi from '../models/Confi.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sk-config',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

const upload = multer({ storage });

const WA_FIELDS = ['whatsappProvider', 'metaAccessToken', 'metaPhoneNumberId', 'metaWebhookToken'];

router.post('/add', upload.single('logo'), async (req, res) => {
  try {
    const { name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube,
            whatsappProvider, metaAccessToken, metaPhoneNumberId, metaWebhookToken } = req.body;
    const logo = req.file ? req.file.path : '';
    const confi = new Confi({ name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube, logo,
                               whatsappProvider, metaAccessToken, metaPhoneNumberId, metaWebhookToken });
    await confi.save();
    res.status(201).json({ success: true, result: confi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/GetConfiList', async (req, res) => {
  try {
    const data = await Confi.find().sort({ createdAt: -1 });
    res.json({ success: true, result: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const { name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube,
            whatsappProvider, metaAccessToken, metaPhoneNumberId, metaWebhookToken } = req.body;
    const update = { name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube,
                     whatsappProvider, metaAccessToken, metaPhoneNumberId, metaWebhookToken };
    if (req.file) update.logo = req.file.path;
    const confi = await Confi.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, result: confi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Confi.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
