import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  phone:       { type: String },
  name:        { type: String },
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  productName: { type: String },
  message:     { type: String },
  source:      { type: String, enum: ['whatsapp', 'web', 'manual'], default: 'whatsapp' },
  status:      { type: String, enum: ['new', 'contacted', 'qualified', 'closed', 'lost'], default: 'new' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  notes:       { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
