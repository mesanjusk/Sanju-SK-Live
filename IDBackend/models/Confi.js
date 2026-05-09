import mongoose from 'mongoose';

const confiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  whatsappNumber: { type: String },
  address: { type: String },
  fb: { type: String },
  insta: { type: String },
  twitter: { type: String },
  linkedIn: { type: String },
  youtube: { type: String },
  logo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Confi', confiSchema);
