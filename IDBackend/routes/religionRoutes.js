import express from 'express';
import { v4 as uuid } from 'uuid';
import Religion from '../models/Religion.js';

const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Religion.findOne({ name });
    if (existing) return res.json('exist');
    const religion = new Religion({ name, religion_uuid: uuid() });
    await religion.save();
    res.json('notexist');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/GetReligionList', async (req, res) => {
  try {
    const data = await Religion.find({});
    res.json({ success: true, result: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Religion.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
