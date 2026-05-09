import mongoose from 'mongoose';

const seodesSchema = new mongoose.Schema({
  seodes_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('SEODes', seodesSchema);
