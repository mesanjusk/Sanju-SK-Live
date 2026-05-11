import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import Lead from '../models/Lead.js';
import Listing from '../models/Listing.js';
import Confi from '../models/Confi.js';

const router = express.Router();

// Send a product enquiry notification to the team via Meta WhatsApp API
async function notifyTeam({ productName, productId, categoryName, imageUrl, price, productLink }) {
  try {
    const confi = await Confi.findOne().sort({ createdAt: -1 }).lean();
    const accessToken   = confi?.metaAccessToken   || process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneNumberId = confi?.metaPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    const teamPhone     = (confi?.whatsappNumber || confi?.phone || '').replace(/\D/g, '');
    const apiVersion    = process.env.WHATSAPP_API_VERSION || 'v19.0';

    if (!accessToken || !phoneNumberId || !teamPhone) return;

    const url     = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    const caption =
      `🛒 *New Enquiry Received*\n` +
      `📦 Product: *${productName}*\n` +
      `🆔 Product ID: ${productId || '—'}\n` +
      (categoryName ? `📂 Category: ${categoryName}\n` : '') +
      (price ? `💰 Price: ₹${price}\n` : '') +
      `🔗 ${productLink || ''}`;

    if (imageUrl) {
      await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type:    'individual',
        to:                teamPhone,
        type:              'image',
        image:             { link: imageUrl, caption },
      }, { headers, timeout: 10000 });
    } else {
      await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type:    'individual',
        to:                teamPhone,
        type:              'text',
        text:              { preview_url: false, body: caption },
      }, { headers, timeout: 10000 });
    }
  } catch (err) {
    // Non-critical — never block lead creation
    console.error('[leads] team notify error:', err?.response?.data || err.message);
  }
}

// GET /api/leads - list all leads with filters
router.get('/', async (req, res) => {
  try {
    const { status, source, assignedTo, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status)     filter.status = status;
    if (source)     filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search)     filter.$or = [
      { phone: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'User_name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, result: leads, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leads/stats - dashboard summary
router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, today, thisWeek] = await Promise.all([
      Lead.countDocuments(),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Lead.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);
    const statusMap = {};
    byStatus.forEach((s) => { statusMap[s._id] = s.count; });
    res.json({ success: true, total, today, thisWeek, byStatus: statusMap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads - create lead
router.post('/', async (req, res) => {
  try {
    const { productId, productName, message, imageUrl, categoryName, price, productLink, ...rest } = req.body;
    const leadData = { ...rest, productName, message };

    let listing = null;
    if (productId) {
      const isValidId = mongoose.Types.ObjectId.isValid(productId);
      if (isValidId) {
        listing = await Listing.findById(productId).lean();
        if (listing) leadData.productId = productId;
        // Valid ObjectId but not in DB — lead saved without reference
      }
      // Invalid ObjectId format — skip to avoid cast error
    }

    const lead = new Lead(leadData);
    await lead.save();

    // Fire-and-forget team notification with actual WhatsApp image
    const resolvedProductId = listing?.productId || productId || '';
    notifyTeam({
      productName: productName || listing?.title || '',
      productId:   resolvedProductId,
      categoryName,
      imageUrl:    imageUrl || (listing?.images?.[0] ?? ''),
      price:       price || listing?.price || '',
      productLink,
    });

    res.status(201).json({ success: true, result: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/leads/:id - update lead
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'User_name role');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, result: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
