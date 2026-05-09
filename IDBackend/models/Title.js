import mongoose from 'mongoose';

const titleSchema = new mongoose.Schema({
  title_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('Title', titleSchema);
