import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  platform: { type: String, enum: ['youtube', 'instagram', 'upload'], default: 'youtube' },
  videoUrl: {type:String,default:''},
  posterUrl: {type:String,default:''},
  cloudinaryPublicId: {type:String,default:''},
  duration: {type:Number,default:0},
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Video', videoSchema);
