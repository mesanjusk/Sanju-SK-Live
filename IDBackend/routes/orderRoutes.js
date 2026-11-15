import express from 'express';
import axios from 'axios';
import {createHmac} from 'node:crypto';
import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Order from '../models/Order.js';
import {priceForQuantity,isPaymentSignatureValid,secureEqualHex} from '../utils/commerce.js';
import {verifyToken} from '../utils/authMiddleware.js';

const router=express.Router();
const enabled=()=>process.env.PAYMENTS_ENABLED==='true' && Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const auth=()=>({username:process.env.RAZORPAY_KEY_ID,password:process.env.RAZORPAY_KEY_SECRET});
const clean=(text,max)=>String(text||'').trim().slice(0,max);
router.get('/config',(_req,res)=>{
  res.set('Cache-Control','no-store');
  res.json({upiEnabled:enabled(),gateway:'razorpay'});
});

// Payment initiation is intentionally unavailable until merchant keys and explicit activation exist.
router.post('/checkout',async(req,res)=>{
  if(!enabled())return res.status(503).json({message:'UPI checkout is not activated. Please request a quotation.'});
  const {productId,quantity,customer={}}=req.body||{};
  if(!mongoose.Types.ObjectId.isValid(productId))return res.status(400).json({message:'Invalid design.'});
  const name=clean(customer.name,80),phone=clean(customer.phone,15),
    address=clean(customer.address,500),instructions=clean(customer.instructions,500);
  if(name.length<2 || !/^[6-9]\d{9}$/.test(phone) || address.length<10)
    return res.status(400).json({message:'Enter a valid name, 10-digit mobile number and delivery address.'});
  try{
    const listing=await Listing.findById(productId).lean();
    if(!listing)return res.status(404).json({message:'Design no longer available.'});
    let pricing;
    try{pricing=priceForQuantity(listing,quantity);}
    catch(e){return res.status(422).json({message:e.message});}
    const local=new Order({
      listing:listing._id,title:listing.title,quantity:pricing.quantity,unitPrice:pricing.unitPrice,
      amountPaise:pricing.amountPaise,customer:{name,phone,address,instructions}
    });
    const response=await axios.post('https://api.razorpay.com/v1/orders',{
      amount:pricing.amountPaise,currency:'INR',receipt:'SK-'+local._id,
      partial_payment:false,notes:{designId:String(listing._id),orderReference:String(local._id)}
    },{auth:auth(),timeout:12000});
    const remote=response.data;
    if(!remote?.id || remote.amount!==pricing.amountPaise || remote.currency!=='INR')
      throw new Error('Gateway order validation failed');
    local.gatewayOrderId=remote.id;
    await local.save();
    res.status(201).json({gatewayOrderId:remote.id,amountPaise:local.amountPaise,
      publicKey:process.env.RAZORPAY_KEY_ID,orderRef:String(local._id),currency:'INR'});
  }catch(e){
    console.error('Payment initialization failed',e.response?.status || e.message);
    res.status(502).json({message:'UPI service is temporarily unavailable. Please request a quote.'});
  }
});

router.post('/verify',async(req,res)=>{
  if(!enabled())return res.status(503).json({message:'Payments are not enabled.'});
  const {razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body||{};
  if(!/^order_[\w-]{5,80}$/.test(String(orderId||'')) ||
     !/^pay_[\w-]{5,80}$/.test(String(paymentId||'')))
    return res.status(400).json({verified:false,message:'Invalid payment reference.'});
  if(!isPaymentSignatureValid(orderId,paymentId,signature,process.env.RAZORPAY_KEY_SECRET))
    return res.status(400).json({verified:false,message:'Payment verification failed.'});
  try{
    const order=await Order.findOne({gatewayOrderId:orderId});
    if(!order)return res.status(404).json({verified:false,message:'Order not found.'});
    const response=await axios.get('https://api.razorpay.com/v1/payments/'+encodeURIComponent(paymentId),
      {auth:auth(),timeout:12000});
    const payment=response.data;
    if(payment.order_id!==orderId || payment.amount!==order.amountPaise ||
        payment.currency!=='INR'||!['captured','authorized'].includes(payment.status))
      return res.status(409).json({verified:false,message:'Payment details do not match this order.'});
    if(payment.status!=='captured')
      return res.status(202).json({verified:false,status:'pending_payment',orderRef:String(order._id)});
    await Order.updateOne({_id:order._id,status:'pending_payment'},{$set:{
      status:'paid',gatewayPaymentId:paymentId,paidAt:new Date()
    }});
    res.json({verified:true,status:'paid',orderRef:String(order._id)});
  }catch(e){
    console.error('Payment confirmation failed',e.response?.status || e.message);
    res.status(502).json({verified:false,message:'Payment not yet confirmed. Please do not repay.'});
  }
});

// Razorpay can send capture after the browser closes. Webhook is signature-verified and idempotent.
router.post('/webhook',async(req,res)=>{
  const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
  if(!secret || !Buffer.isBuffer(req.rawBody))return res.sendStatus(503);
  const expected=createHmac('sha256',secret).update(req.rawBody).digest('hex');
  if(!secureEqualHex(expected,req.get('x-razorpay-signature')))return res.sendStatus(401);
  const event=req.body?.event;
  const payment=req.body?.payload?.payment?.entity;
  try {
    if(event==='payment.captured' && payment?.order_id && payment?.id){
      await Order.updateOne({gatewayOrderId:payment.order_id,amountPaise:payment.amount,
          status:'pending_payment'},
        {$set:{status:'paid',gatewayPaymentId:payment.id,paidAt:new Date()}});
    }
    if(event==='refund.processed' && payment?.order_id){
      // Full refunds require manual reconciliation; never silently re-label a partial refund.
      console.info('Refund webhook received for reconciliation');
    }
    return res.sendStatus(200);
  }catch(e){console.error('Order webhook error',e.message);return res.sendStatus(500);}
});

// Customer PII is never returned by public order endpoints.
router.get('/',verifyToken,async(req,res)=>{
  if(!['admin','manager'].includes(req.user?.role))return res.sendStatus(403);
  const orders=await Order.find().sort({createdAt:-1}).limit(100);
  res.json({result:orders});
});
export default router;
