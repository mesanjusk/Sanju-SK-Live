// models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

export default mongoose.model('Category', categorySchema);
