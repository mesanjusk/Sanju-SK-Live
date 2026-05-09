import express from 'express';
import Visitor from '../models/Visitor.js';

const router = express.Router();

/* POST /api/analytics/track — called by frontend on each page load / event */
router.post('/track', async (req, res) => {
  try {
    const { visitorId, path, referrer, userAgent, device, event, meta, isNew } = req.body;
    if (!visitorId) return res.status(400).json({ ok: false });
    await Visitor.create({ visitorId, path, referrer, userAgent, device, event: event || 'pageview', meta: meta || {}, isNew: !!isNew });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* GET /api/analytics/summary — admin overview */
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay   = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

    const [todayAll, weekAll, monthAll, totalAll] = await Promise.all([
      Visitor.find({ createdAt: { $gte: startOfDay },  event: 'pageview' }),
      Visitor.find({ createdAt: { $gte: startOfWeek }, event: 'pageview' }),
      Visitor.find({ createdAt: { $gte: startOfMonth },event: 'pageview' }),
      Visitor.find({ event: 'pageview' }),
    ]);

    const uniq = (arr) => new Set(arr.map((v) => v.visitorId)).size;
    const newV = (arr) => arr.filter((v) => v.isNew).length;

    /* Top pages */
    const pageCounts = {};
    monthAll.forEach((v) => { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1; });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }));

    /* WhatsApp click events */
    const waClicks = await Visitor.countDocuments({ event: 'whatsapp_click', createdAt: { $gte: startOfMonth } });

    /* Device split */
    const devices = { mobile: 0, tablet: 0, desktop: 0 };
    monthAll.forEach((v) => { if (devices[v.device] !== undefined) devices[v.device]++; });

    res.json({
      today:   { total: todayAll.length,  unique: uniq(todayAll),  newVisitors: newV(todayAll) },
      week:    { total: weekAll.length,   unique: uniq(weekAll),   newVisitors: newV(weekAll) },
      month:   { total: monthAll.length,  unique: uniq(monthAll),  newVisitors: newV(monthAll) },
      allTime: { total: totalAll.length,  unique: uniq(totalAll) },
      topPages,
      waClicks,
      devices,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
