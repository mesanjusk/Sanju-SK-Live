import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationPhone: { type: String, required: true, index: true },
  from:              { type: String, required: true },
  to:                { type: String, required: true },
  body:              { type: String, default: '' },
  type:              { type: String, default: 'text' },
  direction:         { type: String, enum: ['inbound', 'outbound'], required: true },
  metaMessageId:     { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
