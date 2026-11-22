'use strict';
const SITE_URL='https://www.sanjusk.in';
const BACKEND=(process.env.VITE_API_BASE_URL||process.env.API_BASE_URL||'https://sanju-sk-live.onrender.com').replace(/\/$/,'');
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const clean=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const isId=v=>typeof v==='string'&&/^[a-f0-9]{24}$/i.test(v);
const safeJson=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const slugify=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70).replace(/-+$/g,'')||'design';
const photoList=p=>(Array.isArray(p?.images)?p.images:[p?.images]).filter(Boolean)
 .map(src=>typeof src==='string'&&src.startsWith('/')?SITE_URL+src:src)
 .filter(src=>typeof src==='string'&&/^https:\/\//i.test(src)).slice(0,4);
const unitPrice=p=>{
 const flat=Number(p.price);
 if(Number.isFinite(flat)&&flat>0)return {price:flat,minQty:1};
 const tiers=(Array.isArray(p.quantityPricing)?p.quantityPricing:[])
  .filter(x=>Number(x.minQty)>0&&Number(x.price)>0&&Number.isFinite(Number(x.price)))
  .sort((a,b)=>Number(a.price)-Number(b.price));
 return tiers.length?{price:Number(tiers[0].price),minQty:Number(tiers[0].minQty)}:null;
};
const productKey=p=>typeof p==='object'?(p.slug||p._id):p;
const productUrl=p=>SITE_URL+'/products/'+encodeURIComponent(String(productKey(p)||''));
function productSchema(p){
 const url=productUrl(p),images=photoList(p),offer=unitPrice(p);
 const schema={'@type':'Product','@id':url+'#product',name:clean(p.title).slice(0,180),
  url,sku:String(p.sku||p._id),...(p.mpn?{mpn:String(p.mpn)}:{}),
  ...(p.categoryName?{category:clean(p.categoryName)}:{}),
  description:clean(p.seoDescription||p.description||p.title).slice(0,1200),
  brand:{'@type':'Brand',name:'SANJU SK Digital'},
  ...(images.length?{image:images}:{})
 };
 // A quote-only item must not advertise a fabricated zero-price Offer.
 if(offer)schema.offers={'@type':'Offer',url,priceCurrency:'INR',price:offer.price,
  availability:'https://schema.org/InStock',
  ...(offer.minQty>1?{priceSpecification:{
   '@type':'UnitPriceSpecification',price:offer.price,priceCurrency:'INR',
   eligibleQuantity:{'@type':'QuantitativeValue',minValue:offer.minQty,unitCode:'C62'}
  }}:{}),
  seller:{'@type':'LocalBusiness','@id':SITE_URL+'/#business',name:'SANJU SK Digital – Mahi Creation'}
 };
 return schema;
}
function breadcrumbSchema(p){
 const url=productUrl(p),category=clean(p.categoryName||'Products');
 const catUrl=p.categoryName?SITE_URL+'/categories/'+slugify(p.categoryName)+'/':SITE_URL+'/products';
 return {'@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'Home',item:SITE_URL+'/'},
  {'@type':'ListItem',position:2,name:category,item:catUrl},
  {'@type':'ListItem',position:3,name:clean(p.title),item:url}
 ]};
}
function approvedHost(v){
 const h=String(v||'').toLowerCase().split(':')[0];
 return h==='www.sanjusk.in'||h==='sanjusk.in'||/^[a-z0-9-]+\.vercel\.app$/.test(h)?h:'www.sanjusk.in';
}
const fetchWithDeadline=(url,ms)=>fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(ms)});
module.exports={SITE_URL,BACKEND,esc,clean,isId,safeJson,slugify,photoList,unitPrice,productUrl,productSchema,breadcrumbSchema,approvedHost,fetchWithDeadline};
