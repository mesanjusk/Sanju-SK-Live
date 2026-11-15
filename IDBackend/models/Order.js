import mongoose from 'mongoose';

const OrderSchema=new mongoose.Schema({
  listing:{type:mongoose.Schema.Types.ObjectId,ref:'Listing',required:true},
  title:{type:String,required:true},
  quantity:{type:Number,required:true,min:1},
  unitPrice:{type:Number,required:true,min:0},
  amountPaise:{type:Number,required:true,min:100},
  currency:{type:String,default:'INR',enum:['INR']},
  customer:{
    name:{type:String,required:true},
    phone:{type:String,required:true},
    address:{type:String,required:true},
    instructions:{type:String,default:''}
  },
  status:{type:String,default:'pending_payment',enum:['pending_payment','paid','refunded']},
  gatewayOrderId:{type:String,unique:true,sparse:true},
  gatewayPaymentId:{type:String},
  paidAt:Date
},{timestamps:true});
export default mongoose.model('CommerceOrder',OrderSchema);
