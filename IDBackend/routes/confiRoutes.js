import express from 'express';
import axios from 'axios';
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

// Fetch the actual WhatsApp display phone number from Meta Graph API and cache it
const syncMetaPhone = async (confi) => {
  if (!confi?.metaPhoneNumberId || !confi?.metaAccessToken) return;
  try {
    const version = process.env.WHATSAPP_API_VERSION || 'v19.0';
    const { data } = await axios.get(
      `https://graph.facebook.com/${version}/${confi.metaPhoneNumberId}`,
      {
        params: { fields: 'display_phone_number,verified_name' },
        headers: { Authorization: `Bearer ${confi.metaAccessToken}` },
        timeout: 8000,
      }
    );
    if (data?.display_phone_number) {
      const stripped = data.display_phone_number.replace(/\D/g, '');
      await Confi.findByIdAndUpdate(confi._id, { metaDisplayPhone: stripped });
      return stripped;
    }
  } catch (err) {
    console.error('[confi] meta phone fetch error:', err?.response?.data?.error?.message || err.message);
  }
};

// GET /api/confi/effective-wa-number — returns the phone number to use for wa.me links
router.get('/effective-wa-number', async (req, res) => {
  try {
    const confi = await Confi.findOne().sort({ createdAt: -1 }).lean();
    if (!confi) return res.json({ success: false, phone: '' });

    // If we already have a cached Meta display phone, return it
    if (confi.metaDisplayPhone) {
      return res.json({ success: true, phone: confi.metaDisplayPhone });
    }

    // Try to fetch from Meta API and cache
    const fetched = await syncMetaPhone(confi);
    if (fetched) return res.json({ success: true, phone: fetched });

    // Fall back to manually-entered whatsappNumber or phone
    const fallback = String(confi.whatsappNumber || confi.phone || '').replace(/\D/g, '');
    res.json({ success: true, phone: fallback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/add', upload.single('logo'), async (req, res) => {
  try {
    const { name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube,
            metaAccessToken, metaPhoneNumberId, metaWebhookToken } = req.body;
    const logo = req.file ? req.file.path : '';
    const confi = new Confi({
      name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube, logo,
      whatsappProvider: 'official', metaAccessToken, metaPhoneNumberId, metaWebhookToken,
    });
    await confi.save();
    // Sync Meta phone in background
    syncMetaPhone(confi).catch(() => {});
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
            metaAccessToken, metaPhoneNumberId, metaWebhookToken } = req.body;
    const update = {
      name, email, phone, whatsappNumber, address, fb, insta, twitter, linkedIn, youtube,
      whatsappProvider: 'official', metaAccessToken, metaPhoneNumberId, metaWebhookToken,
      metaDisplayPhone: '', // reset cached phone so it re-fetches on next request
    };
    if (req.file) update.logo = req.file.path;
    const confi = await Confi.findByIdAndUpdate(req.params.id, update, { new: true });
    // Re-sync Meta phone in background
    syncMetaPhone(confi).catch(() => {});
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
