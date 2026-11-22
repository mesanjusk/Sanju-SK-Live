import mongoose from 'mongoose';

const schema=new mongoose.Schema({
 _id:{type:String,required:true},
 revision:{type:Number,default:0}
},{versionKey:false});
export default mongoose.model('CatalogCacheRevision',schema);
