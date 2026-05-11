import mongoose from 'mongoose';

const autoReplySchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true, trim: true, lowercase: true },
    matchType: { type: String, enum: ['exact', 'contains', 'starts_with'], default: 'contains' },
    reply: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    delaySeconds: { type: Number, default: 2, min: 0, max: 30 },
  },
  { timestamps: true }
);

autoReplySchema.index({ isActive: 1, keyword: 1 });

export default mongoose.model('AutoReply', autoReplySchema);
