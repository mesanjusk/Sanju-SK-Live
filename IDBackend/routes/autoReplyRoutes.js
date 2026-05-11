import express from 'express';
import AutoReply from '../models/AutoReply.js';
import { matchRule } from '../middleware/autoReply.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rules = await AutoReply.find().sort({ createdAt: -1 });
    res.json({ success: true, result: rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { keyword, matchType, reply, isActive, delaySeconds } = req.body;
    const rule = new AutoReply({ keyword, matchType, reply, isActive, delaySeconds });
    await rule.save();
    res.status(201).json({ success: true, result: rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { keyword, matchType, reply, isActive, delaySeconds } = req.body;
    const rule = await AutoReply.findByIdAndUpdate(
      req.params.id,
      { keyword, matchType, reply, isActive, delaySeconds },
      { new: true }
    );
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true, result: rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await AutoReply.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint: simulate incoming message and return matched reply
router.post('/test', async (req, res) => {
  try {
    const { text } = req.body;
    const rules = await AutoReply.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    const matched = matchRule(text, rules);
    res.json({ success: true, matched: !!matched, reply: matched?.reply || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
