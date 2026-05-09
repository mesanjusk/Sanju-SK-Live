import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [String],
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
