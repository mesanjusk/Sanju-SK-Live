import mongoose from 'mongoose';

const instaUrlSchema = new mongoose.Schema({
  instaUrl_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('Instaurl', instaUrlSchema);
