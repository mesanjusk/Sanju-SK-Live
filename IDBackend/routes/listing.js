import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import cloudinary from '../utils/cloudinary.js';
import Listing from '../models/Listing.js';
import Category from '../models/Category.js';
import {withSeoSlug} from '../utils/productSeo.js';
import {CloudinaryStorage} from 'multer-storage-cloudinary';

const router=express.Router();
const upload=multer({storage:new CloudinaryStorage({cloudinary,params:{
 folder:'sk-listings',allowed_formats:['jpg','jpeg','png','webp'],
 transformation:[{width:1200,height:1200,crop:'limit',quality:'auto'}]
}})});
const cache=new Map(),TTL=90000,STALE=86400000,LIMIT=50;
const invalidate=()=>cache.clear();
function setCached(key,data){
 if(cache.size>=LIMIT)cache.delete(cache.keys().next().value);
 cache.set(key,{data,at:Date.now()});
}
const active={active:{$ne:false}};
function imageList(req){
 const old=req.body.existingImages?JSON.parse(req.body.existingImages):[];
 return [...(Array.isArray(old)?old:[]),...(req.files||[]).map(f=>f.path)].slice(0,4);
}
function payload(req){
 const fields=['title','description','category','subcategory','religions','size','badge',
 'youtubeUrl','instagramUrl','seoTitle','seoDescription','seoKeywords','favorite'];
 const data=Object.fromEntries(fields.filter(k=>req.body[k]!==undefined).map(k=>[k,req.body[k]]));
 if(req.body.price!==undefined)data.price=Number(req.body.price)||0;
 if(req.body.quantityPricing!==undefined)data.quantityPricing=JSON.parse(req.body.quantityPricing||'[]');
 data.images=imageList(req);
 return data;
}
router.post('/',upload.array('images',4),async(req,res)=>{
 try {const p=await new Listing(payload(req)).save();invalidate();res.status(201).json(p);}
 catch(e){res.status(500).json({error:e.message});}
});
router.get('/',async(req,res)=>{
 const {category,subcategory,search,religion,sort}=req.query;
 const filter={...active};
 if(category)filter.category=String(category);
 if(subcategory)filter.subcategory=String(subcategory);
 if(religion)filter.religions=String(religion);
 if(search){
  const pattern=String(search).trim().slice(0,80).replace(/[\^$.*+?()[\]{}|]/g,'\\$&');
  filter.title={$regex:pattern,$options:'i'};
 }
 const key=JSON.stringify({category,subcategory,search,religion,sort}),item=cache.get(key);
 if(item && Date.now()-item.at<TTL)return res.json(item.data);
 try{
  let query=Listing.find(filter).lean();
  if(sort==='price-asc')query=query.sort({price:1});
  else if(sort==='price-desc')query=query.sort({price:-1});
  else query=query.sort({createdAt:-1});
  const data=(await query.maxTimeMS(12000)).map(withSeoSlug);
  setCached(key,data);
  res.set('Cache-Control','public, max-age=30, stale-while-revalidate=120');
  res.json(data);
 }catch(e){
  console.error('Catalog DB query failure',e);
  if(item && Date.now()-item.at<STALE){
   res.set('Warning','110 - "Catalog temporarily stale"');return res.json(item.data);
  }
  res.set('Retry-After','30').status(503).json({error:'Catalog temporarily unavailable'});
 }
});
router.get('/seo-index',async(_req,res)=>{
 const key='seo-index',item=cache.get(key);
 if(item && Date.now()-item.at<TTL)return res.json(item.data);
 try{
  const data=(await Listing.find(active).select('_id title slug category subcategory price quantityPricing images description seoTitle seoDescription createdAt updatedAt').lean().maxTimeMS(12000)).map(withSeoSlug);
  setCached(key,data);
  res.set('Cache-Control','public, max-age=60, stale-while-revalidate=300');
  res.json(data);
 }catch(e){
  if(item && Date.now()-item.at<STALE)return res.json(item.data);
  res.set('Retry-After','30').status(503).json({error:'SEO catalog unavailable'});
 }
});
router.get('/:key',async(req,res)=>{
 const key=String(req.params.key||'');
 if(key.length>150)return res.status(404).json({error:'Listing not found'});
 const id=mongoose.isValidObjectId(key),cacheKey='item:'+key,item=cache.get(cacheKey);
 if(item && Date.now()-item.at<TTL)return res.json(item.data);
 try{
  const p=await Listing.findOne({...active,...(id?{_id:key}:{slug:key})}).lean().maxTimeMS(12000);
  if(!p)return res.status(404).json({error:'Listing not found'});
  const categoryId=String(p.category?._id||p.category||'');
  let categoryName='';
  if(mongoose.isValidObjectId(categoryId)){
   try{
    const c=await Category.findById(categoryId).select('name').lean().maxTimeMS(4000);
    categoryName=c?.name||'';
   }catch(e){console.warn('Category name lookup skipped for listing',key,e.message);}
  }else if(categoryId && !/^[a-f0-9]{24}$/i.test(categoryId))categoryName=categoryId;
  const data={...withSeoSlug(p),...(categoryName?{categoryName}:{})};setCached(cacheKey,data);
  res.set('Cache-Control','public, max-age=60, stale-while-revalidate=300');
  res.json(data);
 }catch(e){
  if(item && Date.now()-item.at<STALE)return res.json(item.data);
  res.set('Retry-After','30').status(503).json({error:'Listing temporarily unavailable'});
 }
});
router.put('/:id',upload.array('images',4),async(req,res)=>{
 try{
  const p=await Listing.findByIdAndUpdate(req.params.id,{$set:{...payload(req),updatedAt:new Date()}},{new:true,runValidators:true});
  if(!p)return res.status(404).json({error:'Listing not found'});
  invalidate();res.json(p);
 }catch(e){res.status(500).json({error:e.message});}
});
router.delete('/:id',async(req,res)=>{
 try{await Listing.findByIdAndDelete(req.params.id);invalidate();res.json({success:true});}
 catch(e){res.status(500).json({error:e.message});}
});
export default router;
