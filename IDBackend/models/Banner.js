import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  public_id: { type: String, default: '' },
  altText: { type: String, default: '' },
  ctaUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Banner', bannerSchema);
