import express from 'express';
import Listing from '../models/Listing.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import {buildGoogleMerchantXml} from '../utils/googleMerchantFeed.js';
import {getCachedGoogleMerchantFeed} from '../utils/googleMerchantCache.js';

const router=express.Router();
router.get('/google-merchant.xml',async(req,res)=>{
 try{
  const xml=await getCachedGoogleMerchantFeed(async()=>{
   const [products,categories,subcategories]=await Promise.all([
    Listing.find({active:{$ne:false},published:{$ne:false}})
     .select('_id title slug active published description seoDescription material size customizationDetails category subcategory price quantityPricing images imageUrl status')
     .lean().maxTimeMS(18000),
    Category.find().select('_id name').lean().maxTimeMS(12000),
    Subcategory.find().select('_id name').lean().maxTimeMS(12000)
   ]);
   const result=buildGoogleMerchantXml(products,categories,subcategories);
   console.info('Google Merchant feed refreshed',
    {catalogSize:products.length,eligibleItems:(result.match(/<item>/g)||[]).length});
   return result;
  });
  res.set('Content-Type','application/xml; charset=utf-8');
  res.set('X-Content-Type-Options','nosniff');
  // Intermediaries must not retain old XML after admin cache invalidation.
  res.set('Cache-Control','no-store');
  return res.status(200).send(req.method==='HEAD'?'':xml);
 }catch(error){
  console.error('Google Merchant feed error',error);
  res.set('Retry-After','60').set('Cache-Control','no-store');
  return res.status(503).type('text/plain').send('Merchant product feed temporarily unavailable');
 }
});
export default router;
