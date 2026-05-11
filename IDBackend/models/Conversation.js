import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  phone:       { type: String, required: true, unique: true },
  name:        { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  lastAt:      { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
