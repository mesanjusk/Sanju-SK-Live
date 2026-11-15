import express from 'express';
import axios from 'axios';
import {createHmac} from 'node:crypto';
import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Order from '../models/Order.js';
import {isPaymentSignatureValid,secureEqualHex} from '../utils/commerce.js';
import {verifyToken} from '../utils/authMiddleware.js';
import {getPricingPolicy,calculateFinalPricing} from '../utils/orderPricing.js';
import {canMoveOrder,cleanCustomer,cleanCustomization,cleanInput,
  hashTrackingToken,makeTrackingToken,publicOrderStatus} from '../utils/orderLifecycle.js';
import {syncCommerceOrder} from '../utils/orderSync.js';

const router=express.Router();
const configured=()=>getPricingPolicy().configured;
const enabled=()=>process.env.PAYMENTS_ENABLED==='true' && configured() &&
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_WEBHOOK_SECRET);
const auth=()=>({username:process.env.RAZORPAY_KEY_ID,password:process.env.RAZORPAY_KEY_SECRET});
const validId=id=>mongoose.Types.ObjectId.isValid(id);
const validQuantity=q=>Number.isSafeInteger(Number(q))&&Number(q)>=1&&Number(q)<=100000;
const rate=new Map();
function throttle(req,res,next){
  // Local process limit; use an edge/platform rate limiter before high-volume launch.
  const key=String(req.ip||'unknown');
  const now=Date.now();
  for(const [k,v] of rate)if(v.expires<now)rate.delete(k);
  const entry=rate.get(key)||{count:0,expires:now+60000};
  entry.count++;rate.set(key,entry);
  if(entry.count>15)return res.status(429).json({message:'Too many requests. Try again shortly.'});
  next();
}
function staff(req,res,next){
  verifyToken(req,res,()=>{
    if(req.user?.role==='admin'||req.user?.role==='manager'||
      req.user?.permissions?.canManageProducts===true) return next();
    res.sendStatus(403);
  });
}
async function notifyMIS(order,event){
  const result=await syncCommerceOrder(order,event);
  const misSync=!result.configured?'not_configured':result.sent?'sent':'failed';
  await Order.updateOne({_id:order._id},{$set:{misSync,
    ...(result.sent?{misSyncedAt:new Date()}:{})}}).catch(()=>{});
}
function history(order,event,note='',who='system',visible=true){
  order.history.push({event,note:cleanInput(note,300),by:who,public:visible});
}
const reqOrder=(productId,quantity)=>validId(productId)&&validQuantity(quantity);

router.get('/config',(_req,res)=>{
  const policy=getPricingPolicy();
  res.set('Cache-Control','no-store');
  res.json({upiEnabled:enabled(),pricingConfigured:policy.configured,
    gateway:'razorpay',quoteAvailable:true});
});

// Estimate computed solely by the backend. Never use client-side tax/delivery assumptions.
router.get('/estimate',throttle,async(req,res)=>{
  const {productId,quantity}=req.query;
  if(!reqOrder(productId,quantity))return res.status(400).json({message:'Invalid product or quantity.'});
  try{
    const product=await Listing.findById(productId).lean();
    if(!product)return res.sendStatus(404);
    const quote=calculateFinalPricing(product,Number(quantity));
    res.set('Cache-Control','no-store');
    res.json({productId:String(product._id),quantity:quote.quantity,
      unitPrice:quote.unitPrice,basePaise:quote.basePaise,
      taxPaise:quote.taxPaise,deliveryPaise:quote.deliveryPaise,
      totalPaise:quote.finalAmountPaise,taxIncluded:quote.taxIncluded??null,
      needsQuote:quote.needsQuote});
  }catch(e){res.status(422).json({message:cleanInput(e.message,120)});}
});

// Save a quote enquiry as an order even while the merchant payment gateway is disabled.
router.post('/enquiries',throttle,async(req,res)=>{
  const {productId,quantity,customer,customization}=req.body||{};
  if(!reqOrder(productId,quantity))return res.status(400).json({message:'Invalid design or quantity.'});
  let client,custom;
  try{client=cleanCustomer(customer);custom=cleanCustomization(customization);}
  catch(e){return res.status(400).json({message:e.message});}
  try{
    const product=await Listing.findById(productId).lean();
    if(!product)return res.status(404).json({message:'Design unavailable.'});
    let price={unitPrice:0,basePaise:0,finalAmountPaise:null,taxPaise:0,deliveryPaise:0};
    try{price=calculateFinalPricing(product,Number(quantity));}catch{}
    const access=makeTrackingToken();
    const order=new Order({
      listing:product._id,title:cleanInput(product.title,200),
      quantity:Number(quantity),unitPrice:price.unitPrice||0,
      basePaise:price.basePaise||0,taxPaise:price.taxPaise||0,
      deliveryPaise:price.deliveryPaise||0,amountPaise:price.finalAmountPaise||0,
      customer:client,customization:custom,trackingTokenHash:access.hash,status:'pending_quote',
      workflowStatus:'new_order'
    });
    history(order,'enquiry_created','Quotation requested through the website');
    await order.save();
    await notifyMIS(order,'order.enquiry.created');
    res.status(201).json({orderRef:String(order._id),trackingToken:access.token,
      status:'pending_quote',message:'Your quotation request has been saved.'});
  }catch(e){
    console.error('Order enquiry could not be saved',cleanInput(e.message,120));
    res.status(503).json({message:'Unable to save your request. Please contact our studio on WhatsApp.'});
  }
});

// Authenticated-by-token guest tracking: no public order ID lookup or PII response.
router.post('/track',throttle,async(req,res)=>{
  const orderRef=cleanInput(req.body?.orderRef,45),
    token=cleanInput(req.body?.trackingToken,70);
  if(!validId(orderRef)||!/^[a-f0-9]{64}$/.test(token))
    return res.status(400).json({message:'Invalid tracking details.'});
  try{
    const record=await Order.findOne({_id:orderRef,trackingTokenHash:hashTrackingToken(token)});
    if(!record)return res.status(404).json({message:'Order not found. Check your reference and tracking key.'});
    res.set('Cache-Control','no-store');
    res.json({order:publicOrderStatus(record)});
  }catch{res.status(503).json({message:'Tracking is temporarily unavailable.'});}
});

// Customers approve/reject an artwork proof only when the studio has submitted one.
router.post('/artwork-decision',throttle,async(req,res)=>{
  const orderRef=cleanInput(req.body?.orderRef,45),token=cleanInput(req.body?.trackingToken,70);
  const decision=cleanInput(req.body?.decision,32),note=cleanInput(req.body?.note,300);
  if(!validId(orderRef)||!/^[a-f0-9]{64}$/.test(token)||
    !['approve','request_changes'].includes(decision))
    return res.status(400).json({message:'Invalid approval request.'});
  try{
    const order=await Order.findOne({_id:orderRef,trackingTokenHash:hashTrackingToken(token)});
    if(!order)return res.sendStatus(404);
    if(order.artworkStatus!=='awaiting_approval'||!order.artworkPreviewUrl)
      return res.status(409).json({message:'Artwork proof is not currently awaiting your approval.'});
    order.artworkStatus=decision==='approve'?'approved':'revision_requested';
    if(decision==='request_changes')order.workflowStatus='design_in_progress';
    history(order,decision==='approve'?'artwork_approved':'artwork_changes_requested',note,'customer');
    await order.save();
    await notifyMIS(order,'order.artwork.decision');
    res.json({order:publicOrderStatus(order)});
  }catch{res.status(503).json({message:'Could not save artwork decision.'});}
});

// Do not accept online payments without exact tax/delivery rules and merchant configuration.
router.post('/checkout',throttle,async(req,res)=>{
  if(!enabled())return res.status(503).json({message:'UPI checkout requires verified merchant and pricing setup. Request a quotation.'});
  const {productId,quantity,customer,customization}=req.body||{};
  if(!reqOrder(productId,quantity))return res.status(400).json({message:'Invalid product or quantity.'});
  let client,custom;
  try{client=cleanCustomer(customer,true);custom=cleanCustomization(customization);}
  catch(e){return res.status(400).json({message:e.message});}
  try{
    const listing=await Listing.findById(productId).lean();
    if(!listing)return res.status(404).json({message:'Design no longer available.'});
    let pricing;
    try{pricing=calculateFinalPricing(listing,Number(quantity));}
    catch(e){return res.status(422).json({message:e.message});}
    if(pricing.needsQuote)return res.status(422).json({message:'Price needs manual quotation.'});
    const access=makeTrackingToken();
    const local=new Order({
      listing:listing._id,title:cleanInput(listing.title,200),
      quantity:pricing.quantity,unitPrice:pricing.unitPrice,
      basePaise:pricing.basePaise,taxPaise:pricing.taxPaise,
      deliveryPaise:pricing.deliveryPaise,amountPaise:pricing.finalAmountPaise,
      taxIncluded:pricing.taxIncluded,customer:client,customization:custom,
      trackingTokenHash:access.hash,status:'pending_payment'
    });
    const response=await axios.post('https://api.razorpay.com/v1/orders',{
      amount:local.amountPaise,currency:'INR',receipt:'SK-'+local._id,
      partial_payment:false,notes:{designId:String(listing._id),orderReference:String(local._id)}
    },{auth:auth(),timeout:12000});
    const remote=response.data;
    if(!remote?.id||remote.amount!==local.amountPaise||remote.currency!=='INR')
      throw new Error('Gateway amount mismatch');
    local.gatewayOrderId=remote.id;
    history(local,'payment_pending','Waiting for secure online payment');
    await local.save();
    await notifyMIS(local,'order.payment.started');
    res.status(201).json({gatewayOrderId:remote.id,amountPaise:local.amountPaise,
      publicKey:process.env.RAZORPAY_KEY_ID,orderRef:String(local._id),
      trackingToken:access.token,currency:'INR'});
  }catch(e){
    console.error('Payment initialization failed',e.response?.status||cleanInput(e.message,100));
    res.status(502).json({message:'Payment service temporarily unavailable. Please request a quote.'});
  }
});

router.post('/verify',throttle,async(req,res)=>{
  if(!enabled())return res.status(503).json({message:'Payments are not enabled.'});
  const {razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body||{};
  if(!/^order_[\w-]{5,80}$/.test(String(orderId||''))||
     !/^pay_[\w-]{5,80}$/.test(String(paymentId||'')))
    return res.status(400).json({verified:false,message:'Invalid payment reference.'});
  if(!isPaymentSignatureValid(orderId,paymentId,signature,process.env.RAZORPAY_KEY_SECRET))
    return res.status(400).json({verified:false,message:'Payment verification failed.'});
  try{
    const order=await Order.findOne({gatewayOrderId:orderId});
    if(!order)return res.status(404).json({verified:false,message:'Order not found.'});
    const response=await axios.get('https://api.razorpay.com/v1/payments/'+encodeURIComponent(paymentId),
      {auth:auth(),timeout:12000});
    const pay=response.data;
    if(pay.order_id!==orderId||pay.amount!==order.amountPaise||
      pay.currency!=='INR'||!['captured','authorized'].includes(pay.status))
      return res.status(409).json({verified:false,message:'Gateway payment details do not match.'});
    if(pay.status!=='captured')
      return res.status(202).json({verified:false,status:'pending_payment',orderRef:String(order._id)});
    if(order.gatewayPaymentId && order.gatewayPaymentId!==paymentId)
      return res.status(409).json({verified:false,message:'This order already has a different payment.'});
    await Order.updateOne({_id:order._id,status:'pending_payment'},
      {$set:{status:'paid',gatewayPaymentId:paymentId,paidAt:new Date()},
        $push:{history:{event:'payment_verified',note:'Gateway capture confirmed',
          by:'gateway',public:true}}});
    const saved=await Order.findById(order._id);
    await notifyMIS(saved,'order.payment.verified');
    res.json({verified:true,status:'paid',orderRef:String(order._id)});
  }catch(e){
    console.error('Payment confirmation failed',e.response?.status||cleanInput(e.message,100));
    res.status(502).json({verified:false,message:'Payment not confirmed yet. Please do not pay again.'});
  }
});

// HMAC-verified Razorpay raw body; idempotent capture and refund reconciliation.
router.post('/webhook',async(req,res)=>{
  const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
  if(!secret||!Buffer.isBuffer(req.rawBody))return res.sendStatus(503);
  const expected=createHmac('sha256',secret).update(req.rawBody).digest('hex');
  if(!secureEqualHex(expected,req.get('x-razorpay-signature')))return res.sendStatus(401);
  const event=req.body?.event;
  const payment=req.body?.payload?.payment?.entity;
  const refund=req.body?.payload?.refund?.entity;
  try{
    if(event==='payment.captured'&&payment?.order_id&&payment?.id&&
      payment.currency==='INR'&&Number.isSafeInteger(payment.amount)){
      const update=await Order.findOneAndUpdate({
        gatewayOrderId:payment.order_id,amountPaise:payment.amount,
        status:'pending_payment'
      },{$set:{status:'paid',gatewayPaymentId:payment.id,paidAt:new Date()},
        $push:{history:{event:'payment_verified',note:'Gateway capture confirmed',
          by:'gateway',public:true}}},{new:true});
      if(update)await notifyMIS(update,'order.payment.verified');
    }
    if(event==='refund.processed'&&refund?.id&&refund?.payment_id&&
      Number.isSafeInteger(refund.amount)&&refund.amount>0){
      const order=await Order.findOneAndUpdate({
        gatewayPaymentId:refund.payment_id,
        'refundRecords.refundId':{$ne:refund.id}
      },{$push:{refundRecords:{refundId:refund.id,amountPaise:refund.amount}}},{new:true});
      if(order){
        const refundedPaise=order.refundRecords.reduce((n,r)=>n+(r.amountPaise||0),0);
        const fullyRefunded=refundedPaise>=order.amountPaise;
        await Order.updateOne({_id:order._id},{$set:{
          refundedPaise,...(fullyRefunded?{status:'refunded'}:{})
        },$push:{history:{event:'refund_processed',note:'Gateway refund confirmed',
          by:'gateway',public:true}}});
        await notifyMIS(order,'order.refund.processed');
      }
    }
    res.sendStatus(200);
  }catch(e){console.error('Order webhook error',cleanInput(e.message,100));res.sendStatus(500);}
});

router.get('/',staff,async(req,res)=>{
  const page=Math.min(10000,Math.max(1,Number(req.query.page)||1)),
    limit=Math.min(100,Math.max(1,Number(req.query.limit)||50));
  const filters={};
  if(req.query.workflowStatus && [
    'new_order','design_in_progress','awaiting_approval','ready_for_print',
    'in_print','post_print','ready','delivered','on_hold','cancelled'
  ].includes(req.query.workflowStatus))filters.workflowStatus=req.query.workflowStatus;
  try{
    const [orders,total]=await Promise.all([
      Order.find(filters).sort({createdAt:-1}).skip((page-1)*limit).limit(limit).lean(),
      Order.countDocuments(filters)
    ]);
    res.set('Cache-Control','no-store');
    res.json({result:orders,total,page,limit});
  }catch{res.status(503).json({message:'Order records are temporarily unavailable.'});}
});

router.patch('/:id',staff,async(req,res)=>{
  if(!validId(req.params.id))return res.sendStatus(400);
  const action=cleanInput(req.body?.action,40),value=req.body?.value;
  try{
    const order=await Order.findById(req.params.id);
    if(!order)return res.sendStatus(404);
    const by=cleanInput(req.user?.username||'staff',80);
    if(action==='workflow'){
      if(!canMoveOrder(order.workflowStatus,value,order.artworkStatus))
        return res.status(409).json({message:'Invalid next step or customer artwork approval is still required.'});
      order.workflowStatus=value;
      history(order,'workflow_'+value,'Moved by studio',by);
    }else if(action==='submit_artwork'){
      const url=cleanInput(value,500);
      if(!/^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\//.test(url))
        return res.status(422).json({message:'Upload a Cloudinary image proof before requesting approval.'});
      if(['delivered','cancelled'].includes(order.workflowStatus))
        return res.status(409).json({message:'Finished order cannot request new artwork approval.'});
      order.artworkPreviewUrl=url;order.artworkStatus='awaiting_approval';
      order.workflowStatus='awaiting_approval';
      history(order,'artwork_proof_sent','Proof ready for customer review',by);
    }else if(action==='quotation'){
      if(order.status==='paid'||order.status==='refunded')
        return res.status(409).json({message:'A verified payment cannot be overwritten.'});
      const paise=Number(value);
      if(!Number.isSafeInteger(paise)||paise<100||paise>100000000)
        return res.status(422).json({message:'Enter a valid final quotation amount in paise.'});
      order.quotedAmountPaise=paise;order.status='quoted';
      history(order,'quotation_ready','Final quotation prepared by studio',by);
    }else if(action==='offline_payment'){
      const amount=Number(value?.amountPaise),ref=cleanInput(value?.reference,100);
      if(!Number.isSafeInteger(amount)||amount<=0||amount>100000000||ref.length<4)
        return res.status(422).json({message:'Enter a valid recorded amount and bank/payment reference.'});
      if(order.offlinePaymentReference===ref)
        return res.status(409).json({message:'This payment reference has already been recorded.'});
      order.offlineCollectedPaise+=amount;order.offlinePaymentReference=ref;
      history(order,'offline_payment_recorded','Offline collection recorded; verify against bank',by,false);
    }else if(action==='delivery'){
      const state=cleanInput(value?.status,40);
      if(!['not_dispatched','dispatched','delivered'].includes(state))
        return res.status(422).json({message:'Invalid delivery status.'});
      order.deliveryStatus=state;
      order.courierName=cleanInput(value?.courierName,80);
      order.trackingNumber=cleanInput(value?.trackingNumber,120);
      history(order,'delivery_'+state,'Shipment status updated',by);
    }else if(action==='note'){
      order.adminNotes=cleanInput(value,1000);
      history(order,'admin_note','Private staff note updated',by,false);
    }else return res.status(400).json({message:'Unsupported order update.'});
    await order.save();
    await notifyMIS(order,'order.updated');
    res.json({order});
  }catch(e){
    console.error('Order update failed',cleanInput(e.message,100));
    res.status(503).json({message:'Unable to update this order.'});
  }
});

router.post('/:id/sync',staff,async(req,res)=>{
  if(!validId(req.params.id))return res.sendStatus(400);
  const order=await Order.findById(req.params.id);
  if(!order)return res.sendStatus(404);
  const outcome=await syncCommerceOrder(order,'order.resync');
  order.misSync=!outcome.configured?'not_configured':outcome.sent?'sent':'failed';
  if(outcome.sent)order.misSyncedAt=new Date();
  await order.save();
  res.json({status:order.misSync});
});

export default router;
