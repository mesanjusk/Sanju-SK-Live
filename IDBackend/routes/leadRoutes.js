import express from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Listing from '../models/Listing.js';

const router = express.Router();

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
    const { productId, ...rest } = req.body;
    const leadData = { ...rest };

    if (productId) {
      const isValidId = mongoose.Types.ObjectId.isValid(productId);
      if (isValidId) {
        const exists = await Listing.exists({ _id: productId });
        if (exists) {
          leadData.productId = productId;
        }
        // Product ID valid format but not in DB — save lead without reference
      }
      // Invalid ObjectId format — skip to avoid cast error
    }

    const lead = new Lead(leadData);
    await lead.save();
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
