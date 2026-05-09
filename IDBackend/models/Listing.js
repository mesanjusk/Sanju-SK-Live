import mongoose from 'mongoose';

const quantityPricingSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  maxQty: { type: Number },
  price: { type: Number, required: true },
}, { _id: false });

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: String,
  subcategory: String,
  price: { type: Number, default: 0 },
  religions: String,
  size: String,
  badge: { type: String, default: '' },
  images: { type: [String], validate: v => v.length <= 4 },
  youtubeUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  quantityPricing: { type: [quantityPricingSchema], default: [] },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' },
  favorite: { type: String, default: '0' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Listing', listingSchema);
