import mongoose from 'mongoose';

// Optional analytics only, recorded after the browser's explicit consent.
// Legacy userAgent/referrer fields are intentionally not written any more.
// Browser and session IDs are random pseudonyms, never hardware fingerprints.
const VisitorSchema=new mongoose.Schema({
  visitorId:{type:String,required:true},
  sessionId:{type:String,default:''},
  isNew:{type:Boolean,default:false},
  path:{type:String,default:'/'},
  landingPath:{type:String,default:'/'},
  event:{type:String,required:true},
  productId:{type:String,default:''},
  categoryId:{type:String,default:''},
  categoryName:{type:String,default:''},
  keyword:{type:String,default:''},
  source:{type:String,default:'direct'},
  medium:{type:String,default:'none'},
  campaign:{type:String,default:''},
  referrerDomain:{type:String,default:''},
  device:{type:String,enum:['mobile','tablet','desktop'],default:'desktop'},
  browser:{type:String,enum:['Chrome','Firefox','Safari','Edge','Other'],default:'Other'},
  os:{type:String,enum:['Android','iOS','Windows','macOS','Linux','Other'],default:'Other'},
  networkType:{type:String,enum:['slow-2g','2g','3g','4g','unknown'],default:'unknown'},
  country:{type:String,default:''},
  createdAt:{type:Date,default:Date.now}
},{versionKey:false,strict:true});

VisitorSchema.index({createdAt:-1});
VisitorSchema.index({event:1,createdAt:-1});
VisitorSchema.index({visitorId:1,createdAt:-1});
VisitorSchema.index({productId:1,event:1});
VisitorSchema.index({createdAt:1},{expireAfterSeconds:180*24*60*60});
export default mongoose.model('Visitor',VisitorSchema);
