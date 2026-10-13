'use strict';
const SITE_URL = 'https://www.sanjusk.in';
const BACKEND = (process.env.VITE_API_BASE_URL || 'https://sanju-sk-live.onrender.com').replace(/\/$/, '');
const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const clean = value => String(value ?? '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const isId = v => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);
const safeJson = obj => JSON.stringify(obj).replace(/</g,'\\u003c');
const photoList = product => (Array.isArray(product?.images) ? product.images : [product?.images])
  .filter(v => typeof v === 'string' && /^https:\/\//i.test(v)).slice(0, 4);
const unitPrice = p => {
  const flat = Number(p.price);
  if (flat > 0 && Number.isFinite(flat)) return { price:flat, minQty:1 };
  const tiers = (Array.isArray(p.quantityPricing) ? p.quantityPricing : [])
    .filter(v => Number(v.minQty)>0 && Number(v.price)>0 && Number.isFinite(Number(v.price)))
    .sort((a,b)=>Number(a.price)-Number(b.price));
  if (!tiers.length) return null;
  return {price:Number(tiers[0].price),minQty:Number(tiers[0].minQty)};
};
const productUrl = id => SITE_URL + '/products/' + id;
function productSchema(p) {
  const id=String(p._id), url=productUrl(id);
  const images=photoList(p);
  const schema={ '@context':'https://schema.org', '@type':'Product', '@id':url+'#product',
    name:clean(p.title).slice(0,180), url, sku:id, brand:{ '@type':'Brand', name:'SANJU SK Digital – Mahi Creation' },
    description:clean(p.seoDescription||p.description||p.title).slice(0,1200),
    ...(images.length?{image:images}:{})
  };
  const offer=unitPrice(p);
  if (offer) schema.offers={
    '@type':'Offer', url, priceCurrency:'INR', price:offer.price,
    priceSpecification:{
      '@type':'UnitPriceSpecification', priceCurrency:'INR', price:offer.price,
      referenceQuantity:{'@type':'QuantitativeValue',value:1,unitCode:'C62'},
      ...(offer.minQty>1?{eligibleQuantity:{'@type':'QuantitativeValue',minValue:offer.minQty,unitCode:'C62'}}:{})
    },
    seller:{'@type':'LocalBusiness','@id':SITE_URL+'/#business',name:'SANJU SK Digital – Mahi Creation'}
  };
  return schema;
}
function approvedHost(value) {
  const host=String(value||'').toLowerCase().split(':')[0];
  return host==='www.sanjusk.in'||host==='sanjusk.in'||/^[a-z0-9-]+\.vercel\.app$/.test(host)?host:'www.sanjusk.in';
}
async function fetchWithDeadline(url, ms) {
  return fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(ms)});
}
module.exports={SITE_URL,BACKEND,esc,clean,isId,safeJson,photoList,unitPrice,productUrl,productSchema,approvedHost,fetchWithDeadline};
