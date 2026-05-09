import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorId:  { type: String, required: true },
  isNew:      { type: Boolean, default: true },
  path:       { type: String, default: '/' },
  referrer:   { type: String, default: '' },
  userAgent:  { type: String, default: '' },
  device:     { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  event:      { type: String, default: 'pageview' },
  meta:       { type: Object, default: {} },
  createdAt:  { type: Date, default: Date.now },
});

visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ visitorId: 1 });

export default mongoose.model('Visitor', visitorSchema);
