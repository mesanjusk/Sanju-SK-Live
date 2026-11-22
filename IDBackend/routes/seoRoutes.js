import express from 'express';
import Listing from '../models/Listing.js';
import Category from '../models/Category.js';
import {slugify,withSeoSlug} from '../utils/productSeo.js';
const router=express.Router(),SITE='https://www.sanjusk.in';
const guideSlugs=['visiting-cards','birthday','mementos','cutouts','name-plates','envelopes','id-cards'];
const staticPages=['/','/products','/contact','/wedding-card-printing-gondia/',
 '/3d-led-sign-boards-gondia/','/custom-trophies-awards-gondia/',
 '/flex-banner-printing-gondia/','/digital-wedding-invitations/',
 '/corporate-gifting-gondia/'];
let snapshot,loadedAt=0;
async function data(){
 if(snapshot && Date.now()-loadedAt<120000)return snapshot;
 try{
  const [products,categories]=await Promise.all([
   Listing.find({active:{$ne:false}}).select('_id title slug category images description seoDescription price quantityPricing createdAt updatedAt').lean().maxTimeMS(15000),
   Category.find().select('_id name').lean().maxTimeMS(15000)
  ]);
  snapshot={products:products.map(withSeoSlug),categories};loadedAt=Date.now();return snapshot;
 }catch(e){if(snapshot && Date.now()-loadedAt<86400000)return snapshot;throw e;}
}
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function entry(path,date,frequency,priority){
 const stamp=date&&!Number.isNaN(new Date(date).getTime())?'<lastmod>'+new Date(date).toISOString().slice(0,10)+'</lastmod>':'';
 return '<url><loc>'+esc(SITE+path)+'</loc>'+stamp+'<changefreq>'+frequency+'</changefreq><priority>'+priority+'</priority></url>';
}
router.get('/api/seo/index',async(_req,res)=>{
 try{res.set('Cache-Control','public, max-age=60, stale-while-revalidate=300').json(await data());}
 catch(e){console.error('SEO index failed',e);res.set('Retry-After','30').status(503).json({error:'SEO index unavailable'});}
});
router.get('/sitemap.xml',async(req,res)=>{
 try{
  const {products,categories}=await data();
  const urls=[...staticPages.map(p=>entry(p,null,p==='/'?'weekly':'monthly',p==='/'?'1.0':'0.7')),
   ...[...new Set([...guideSlugs,...categories.map(c=>slugify(c.name))])].map(slug=>entry('/categories/'+encodeURIComponent(slug)+'/',null,'weekly','0.6')),
   ...products.map(p=>entry('/products/'+encodeURIComponent(p.slug),p.updatedAt||p.createdAt,'weekly','0.6'))];
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.join('\n')+'\n</urlset>\n';
  res.set('Content-Type','application/xml; charset=utf-8');
  res.set('Cache-Control','public, max-age=120, stale-while-revalidate=900');
  res.set('X-Content-Type-Options','nosniff');
  res.status(200).send(req.method==='HEAD'?'':xml);
 }catch(e){console.error('Sitemap failed',e);res.set('Retry-After','30').status(503).send('Sitemap temporarily unavailable');}
});
router.get('/robots.txt',(_req,res)=>{
 res.type('text/plain').send('User-agent: *\nAllow: /products/\nAllow: /categories/\nAllow: /feeds/google-merchant.xml\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\nDisallow: /upload\nSitemap: '+SITE+'/sitemap.xml\n');
});
export default router;
