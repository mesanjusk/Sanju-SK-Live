import mongoose from 'mongoose';

const seotitleSchema = new mongoose.Schema({
  seotitle_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('SEOTitle', seotitleSchema);
