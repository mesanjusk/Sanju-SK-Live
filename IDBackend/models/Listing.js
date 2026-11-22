import mongoose from 'mongoose';
import {slugForListing} from '../utils/productSeo.js';

const quantityPricingSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  maxQty: { type: Number },
  price: { type: Number, required: true },
}, { _id: false });

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type:String, trim:true, lowercase:true },
  active: { type:Boolean, default:true },
  updatedAt: { type:Date, default:Date.now },
  description: { type: String, default: '' },
  category: String,
  subcategory: String,
  price: { type: Number, default: 0 },
  religions: String,
  size: String,
  badge: { type: String, default: '' },
  images: { type: [String], validate: v => v.length <= 4 },
  youtubeUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  quantityPricing: { type: [quantityPricingSchema], default: [] },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' },
  favorite: { type: String, default: '0' },
  createdAt: { type: Date, default: Date.now },
});


listingSchema.pre('validate',function(next){
 if(!this.slug && this.title)this.slug=slugForListing(this.title,this._id);
 next();
});
listingSchema.index({slug:1},{unique:true,partialFilterExpression:{slug:{$type:'string'}}});
listingSchema.index({category:1,createdAt:-1});
listingSchema.index({subcategory:1,createdAt:-1});
listingSchema.index({createdAt:-1});
listingSchema.index({active:1,category:1,createdAt:-1});
export default mongoose.model('Listing', listingSchema);

