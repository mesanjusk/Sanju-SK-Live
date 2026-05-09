import mongoose from 'mongoose';

const religionSchema = new mongoose.Schema({
  religion_uuid: { type: String }, 
  name: { type: String, required: true },
});

export default mongoose.model('Religion', religionSchema);
