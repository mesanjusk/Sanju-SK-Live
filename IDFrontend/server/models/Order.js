import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: String,
      address: String,
      contact: String,
      paymentMode: String
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
      }
    ],
    totalAmount: Number,
    status: { type: String, default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
