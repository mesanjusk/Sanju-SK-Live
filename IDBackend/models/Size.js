import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  size_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('Size', sizeSchema);
