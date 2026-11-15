import express from 'express';
import Visitor from '../models/Visitor.js';
import Order from '../models/Order.js';
import Listing from '../models/Listing.js';
import {cleanAnalyticsEvent,isAnonymousId,acceptsAnalyticsOrigin,analyticsWindow}
  from '../utils/growthAnalytics.js';

const router=express.Router();
const rate=new Map();
function guardEvent(req,res,next){
  if(!acceptsAnalyticsOrigin(req.get('origin')))
    return res.status(403).json({message:'Analytics is for the SK Digital storefront only.'});
  const key=String(req.ip||'unknown');
  const now=Date.now();
  if(rate.size>15000)rate.clear();
  const item=rate.get(key)||{start:now,count:0};
  if(now-item.start>60000){item.start=now;item.count=0;}
  item.count++;rate.set(key,item);
  if(item.count>100)return res.status(429).json({message:'Analytics rate limit exceeded.'});
  next();
}
router.post('/track',guardEvent,async(req,res)=>{
  let data;
  try{data=cleanAnalyticsEvent(req.body);}
  catch(e){return res.status(400).json({message:e.message});}
  if(/^\/(admin|login|profile|upload|listing)/i.test(data.path))
    return res.status(204).end();
  // The request carries NO raw IP, hardware ID, or full User-Agent into MongoDB.
  if(process.env.ANALYTICS_TRUST_GEO_HEADERS==='true'){
    const cc=String(req.get('cf-ipcountry')||'').toUpperCase();
    if(/^[A-Z]{2}$/.test(cc))data.country=cc;
  }
  try{await Visitor.create(data);res.status(202).json({ok:true});}
  catch{res.status(503).json({message:'Analytics temporarily unavailable.'});}
});
router.delete('/visitor',guardEvent,async(req,res)=>{
  const id=req.body?.visitorId;
  if(!isAnonymousId(id))return res.status(400).json({message:'Invalid anonymous ID.'});
  try{await Visitor.deleteMany({visitorId:String(id).toLowerCase()});res.status(204).end();}
  catch{res.status(503).json({message:'Deletion temporarily unavailable.'});}
});

const sinceDays=days=>new Date(Date.now()-days*86400000);
async function splitBy(field,base={},limit=10){
  const rows=await Visitor.aggregate([
    {$match:base},
    {$group:{_id:'$'+field,views:{$sum:1}}},
    {$sort:{views:-1}},{$limit:limit}
  ]);
  return rows.map(row=>({label:String(row._id||'unknown'),views:row.views}));
}
async function visitTotals(from){
  const match={event:'pageview',createdAt:{$gte:from}};
  const [views,visitors,sessions]=await Promise.all([
    Visitor.countDocuments(match),
    Visitor.aggregate([{$match:match},{$group:{_id:'$visitorId'}},{$count:'n'}]),
    Visitor.aggregate([{$match:match},{$group:{_id:'$sessionId'}},{$count:'n'}])
  ]);
  return {views,visitors:visitors[0]?.n||0,sessions:sessions[0]?.n||0};
}
router.get('/summary',async(_req,res)=>{
  try{
    const [today,week,month,allTime,topPages,devices,waClicks]=await Promise.all([
      visitTotals(sinceDays(1)),visitTotals(sinceDays(7)),
      visitTotals(sinceDays(30)),visitTotals(new Date(0)),
      splitBy('path',{event:'pageview',createdAt:{$gte:sinceDays(30)}},8),
      splitBy('device',{event:'pageview',createdAt:{$gte:sinceDays(30)}},3),
      Visitor.countDocuments({event:'whatsapp_click',createdAt:{$gte:sinceDays(30)}})
    ]);
    res.set('Cache-Control','no-store');
    res.json({
      today:{total:today.views,unique:today.visitors},
      week:{total:week.views,unique:week.visitors},
      month:{total:month.views,unique:month.visitors},
      allTime:{total:allTime.views,unique:allTime.visitors},
      topPages:topPages.map(x=>({path:x.label,count:x.views})),waClicks,
      devices:Object.fromEntries(devices.map(x=>[x.label,x.views]))
    });
  }catch(e){console.error('Analytics summary failed',e.message);res.sendStatus(503);}
});
router.get('/insights',async(req,res)=>{
  const days=analyticsWindow(req.query.days),since=sinceDays(days);
  const view={event:'pageview',createdAt:{$gte:since}};
  const windowMatch={createdAt:{$gte:since}};
  const listed=['pageview','product_view','category_view','search','favorite_save',
    'checkout_start','quote_request','whatsapp_click','payment_client_confirmed'];
  try{
    const [
      totals,daily,sources,mediums,campaigns,keywords,pages,devices,browsers,operatingSystems,
      networks,countries,categories,productHits,funnel,orders
    ]=await Promise.all([
      visitTotals(since),
      Visitor.aggregate([
        {$match:view},
        {$group:{_id:{$dateToString:{format:'%Y-%m-%d',date:'$createdAt',
          timezone:'Asia/Kolkata'}},views:{$sum:1}}},
        {$sort:{_id:1}}
      ]),
      splitBy('source',view,15),splitBy('medium',view,12),
      splitBy('campaign',{...view,campaign:{$ne:''}},12),
      splitBy('keyword',{...view,keyword:{$ne:''}},12),
      splitBy('path',view,15),splitBy('device',view,4),
      splitBy('browser',view,6),splitBy('os',view,6),
      splitBy('networkType',view,6),splitBy('country',{...view,country:{$ne:''}},15),
      splitBy('categoryName',{event:'category_view',createdAt:{$gte:since}},15),
      Visitor.aggregate([
        {$match:{event:'product_view',createdAt:{$gte:since},productId:{$ne:''}}},
        {$group:{_id:'$productId',views:{$sum:1}}},
        {$sort:{views:-1}},{$limit:15}
      ]),
      Visitor.aggregate([
        {$match:{...windowMatch,event:{$in:listed}}},
        {$group:{_id:'$event',count:{$sum:1}}}
      ]),
      Promise.all([
        Order.countDocuments({createdAt:{$gte:since},status:{$in:['pending_quote','quoted']}}),
        Order.aggregate([
          {$match:{status:'paid',paidAt:{$gte:since}}},
          {$group:{_id:null,count:{$sum:1},grossPaise:{$sum:'$amountPaise'},
            refundedPaise:{$sum:{$ifNull:['$refundedPaise',0]}}}}
        ]),
        Order.aggregate([{$match:{status:'refunded',updatedAt:{$gte:since}}},
          {$group:{_id:null,count:{$sum:1},refundedPaise:{$sum:{$ifNull:['$refundedPaise',0]}}}}])
      ])
    ]);
    const safeIds=productHits.map(x=>x._id).filter(id=>/^[a-f0-9]{24}$/i.test(id));
    const listings=await Listing.find({_id:{$in:safeIds}}).select('title').lean();
    const titleMap=new Map(listings.map(x=>[String(x._id),x.title]));
    const events=Object.fromEntries(funnel.map(x=>[x._id,x.count]));
    const paid=orders[1][0]||{},refunded=orders[2][0]||{};
    res.set('Cache-Control','no-store');
    res.json({
      days,retentionDays:180,
      totals:{...totals,events},
      daily:daily.map(x=>({date:x._id,views:x.views})),
      sources,mediums,campaigns,keywords,topPages:pages,
      devices,browsers,operatingSystems,networks,countries,
      categories,topProducts:productHits.map(x=>({
        id:x._id,title:titleMap.get(String(x._id))||'Design '+String(x._id).slice(-6),
        views:x.views
      })),
      commerce:{
        quoteRequests:orders[0],paidOrders:paid.count||0,
        verifiedGrossPaise:paid.grossPaise||0,
        recordedRefundPaise:(paid.refundedPaise||0)+(refunded.refundedPaise||0),
        fullyRefundedOrders:refunded.count||0
      }
    });
  }catch(e){
    console.error('Growth analytics failed',e.message);
    res.status(503).json({message:'Growth analytics temporarily unavailable.'});
  }
});
export default router;
