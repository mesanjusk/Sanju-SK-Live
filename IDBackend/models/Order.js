import mongoose from 'mongoose';

const historyEntry=new mongoose.Schema({
  event:{type:String,required:true},note:{type:String,default:''},
  by:{type:String,default:'system'},public:{type:Boolean,default:false},
  createdAt:{type:Date,default:Date.now}
},{_id:false});
const OrderSchema=new mongoose.Schema({
  listing:{type:mongoose.Schema.Types.ObjectId,ref:'Listing',required:true},
  title:{type:String,required:true},
  quantity:{type:Number,required:true,min:1},
  unitPrice:{type:Number,required:true,min:0},
  basePaise:{type:Number,default:0,min:0},
  taxPaise:{type:Number,default:0,min:0},
  deliveryPaise:{type:Number,default:0,min:0},
  amountPaise:{type:Number,default:0,min:0},
  taxIncluded:{type:Boolean,default:false},
  currency:{type:String,default:'INR',enum:['INR']},
  customer:{
    name:{type:String,required:true},phone:{type:String,required:true},
    address:{type:String,default:''},instructions:{type:String,default:''}
  },
  customization:{
    size:{type:String,default:''},material:{type:String,default:''},
    deadline:{type:String,default:''},artworkNotes:{type:String,default:''}
  },
  status:{type:String,default:'pending_quote',
    enum:['pending_quote','quoted','pending_payment','paid','refunded']},
  workflowStatus:{type:String,default:'new_order',
    enum:['new_order','design_in_progress','awaiting_approval','ready_for_print',
      'in_print','post_print','ready','delivered','on_hold','cancelled']},
  artworkStatus:{type:String,default:'not_submitted',
    enum:['not_submitted','awaiting_approval','approved','revision_requested']},
  artworkPreviewUrl:{type:String,default:''},
  deliveryStatus:{type:String,default:'not_dispatched',
    enum:['not_dispatched','dispatched','delivered']},
  trackingNumber:{type:String,default:''},
  courierName:{type:String,default:''},
  adminNotes:{type:String,default:''},
  quotedAmountPaise:{type:Number,default:0,min:0},
  offlineCollectedPaise:{type:Number,default:0,min:0},
  offlinePaymentReference:{type:String,default:''},
  trackingTokenHash:{type:String,select:false},
  history:{type:[historyEntry],default:[]},
  misSync:{type:String,default:'not_configured',enum:['not_configured','pending','sent','failed']},
  misSyncedAt:Date,
  gatewayOrderId:{type:String,unique:true,sparse:true},
  gatewayPaymentId:{type:String},
  refundRecords:{type:[new mongoose.Schema({refundId:{type:String},amountPaise:{type:Number}},
    {_id:false})],default:[]},
  refundedPaise:{type:Number,default:0,min:0},
  paidAt:Date
},{timestamps:true});
OrderSchema.index({createdAt:-1,workflowStatus:1});
OrderSchema.index({trackingTokenHash:1},{sparse:true});
export default mongoose.model('CommerceOrder',OrderSchema);
