import express from 'express';
import Video from '../models/Video.js';

const router = express.Router();

// GET /api/videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/videos
router.post('/', async (req, res) => {
  try {
    const { title, youtubeUrl, instagramUrl, platform, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });
    if (platform === 'youtube' && !youtubeUrl) return res.status(400).json({ message: 'YouTube URL is required.' });
    if (platform === 'instagram' && !instagramUrl) return res.status(400).json({ message: 'Instagram URL is required.' });
    const video = new Video({ title, youtubeUrl, instagramUrl, platform, description });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    console.error('Error creating video:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/videos/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, youtubeUrl, instagramUrl, platform, description } = req.body;
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { title, youtubeUrl, instagramUrl, platform, description },
      { new: true }
    );
    res.json(video);
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/videos/:id
router.delete('/:id', async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
