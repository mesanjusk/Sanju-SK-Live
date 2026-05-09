import mongoose from 'mongoose';

const seokeywordSchema = new mongoose.Schema({
  seokeyword_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('SEOKeyword', seokeywordSchema);
