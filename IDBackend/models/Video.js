import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  platform: { type: String, enum: ['youtube', 'instagram'], default: 'youtube' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Video', videoSchema);
