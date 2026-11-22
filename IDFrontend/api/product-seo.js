import shared from '../lib/seo-server.cjs';
const {SITE_URL,BACKEND,esc,clean,isId,safeJson,photoList,unitPrice,productSchema,breadcrumbSchema,productUrl,approvedHost,fetchWithDeadline}=shared;
const htmlCache=new Map();
let shellCache={html:'',time:0};
const removeTags=[
 /<title[^>]*>[\s\S]*?<\/title>/ig,
 /<meta\s+name="description"[^>]*>/ig,
 /<meta\s+name="robots"[^>]*>/ig,
 /<link\s+rel="canonical"[^>]*>/ig,
 /<meta\s+property="og:[^"]+"[^>]*>/ig,
 /<meta\s+name="twitter:[^"]+"[^>]*>/ig,
 /<script\s+type="application\/ld\+json"\s+id="structured-data-jsonld"[^>]*>[\s\S]*?<\/script>/ig
];
async function attempt(fn){
 try{return await fn();}catch(first){return fn();}
}
async function getShell(host){
 if(shellCache.html && Date.now()-shellCache.time<1800000)return shellCache.html;
 try{
  const response=await fetch('https://'+host+'/',{signal:AbortSignal.timeout(9000),headers:{'User-Agent':'SANJU-SK-SEO/2.0'}});
  if(!response.ok)throw new Error('Storefront '+response.status);
  const html=await response.text();
  if(!html.includes('<div id="root">'))throw Error('Invalid Vite HTML shell');
  shellCache={html,time:Date.now()};return html;
 }catch(e){if(shellCache.html)return shellCache.html;throw e;}
}
export function renderProductHtml(shell,p){
 const url=productUrl(p);
 const title=clean(p.seoTitle||p.title).slice(0,105)+' | SANJU SK Digital Gondia';
 const desc=clean(p.seoDescription||p.description||('Explore '+p.title+' custom printing from SANJU SK Digital, Gondia. Ask for a quotation.')).slice(0,160);
 const pics=photoList(p),price=unitPrice(p),image=pics[0]||SITE_URL+'/images/og-preview.png';
 const json=safeJson({'@context':'https://schema.org','@graph':[
  {'@type':'LocalBusiness','@id':SITE_URL+'/#business',name:'SANJU SK Digital – Mahi Creation',telephone:'+919372333633'},
  productSchema(p),breadcrumbSchema(p),
  {'@type':'WebPage','@id':url+'#webpage',url,name:title,description:desc,mainEntity:{'@id':url+'#product'}}
 ]});
 const head='<title>'+esc(title)+'</title>'
 +'<meta name="description" content="'+esc(desc)+'">'
 +'<meta name="robots" content="index,follow,max-image-preview:large">'
 +'<link rel="canonical" href="'+esc(url)+'">'
 +'<meta property="og:type" content="product">'
 +'<meta property="og:title" content="'+esc(title)+'">'
 +'<meta property="og:description" content="'+esc(desc)+'">'
 +'<meta property="og:url" content="'+esc(url)+'">'
 +'<meta property="og:image" content="'+esc(image)+'">'
 +'<meta name="twitter:card" content="summary_large_image">'
 +'<meta name="twitter:title" content="'+esc(title)+'">'
 +'<meta name="twitter:description" content="'+esc(desc)+'">'
 +'<meta name="twitter:image" content="'+esc(image)+'">'
 +'<script type="application/ld+json" id="sk-product-schema">'+json+'</script>';
 const whatsapp='https://wa.me/919372333633?text='+encodeURIComponent('Please quote '+p.title+' (Design ID '+p._id+')');
 const category=clean(p.categoryName||'Products'),categoryLink=p.categoryName?
  '/categories/'+encodeURIComponent(shared.slugify(p.categoryName))+'/':'/products';
 const content='<main id="sk-product-initial" aria-label="Product details">'
 +'<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="'+esc(categoryLink)+'">'+esc(category)+'</a> / '+esc(p.title)+'</nav>'
 +'<article><h1>'+esc(p.title)+'</h1>'
 +(pics[0]?'<img src="'+esc(pics[0])+'" alt="'+esc(p.title)+' - Custom Printing & Design in Gondia" width="520" height="520" fetchpriority="high">':'')
 +'<p>'+esc(p.description||'Custom printed and personalised design available on enquiry.')+'</p>'
 +(price?'<p>Price from ₹'+esc(price.price.toFixed(2))+' per piece; please confirm quotation.</p>':'<p>Contact us for a custom quotation.</p>')
 +'<p><a href="'+esc(whatsapp)+'">Enquire on WhatsApp</a></p>'
 +'<p>SANJU SK Digital – Mahi Creation, Gondia, Maharashtra, India</p></article></main>';
 let doc=shell;
 for(const re of removeTags)doc=doc.replace(re,'');
 doc=doc.replace('</head>',head+'</head>');
 doc=doc.replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<script type="module")/i,
  '<div id="root">'+content+'</div>\n    ');
 if(!doc.includes('id="sk-product-initial"'))throw Error('Could not inject product initial body');
 return doc;
}
export default async function handler(req,res){
 if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).end();
 const key=Array.isArray(req.query.id)?req.query.id[0]:req.query.id;
 if(typeof key!=='string'||key.length>150||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(key))return res.status(404).send('Product not found');
 const cached=htmlCache.get(key);
 if(cached && Date.now()-cached.at<300000){
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).send(req.method==='HEAD'?'':cached.html);
 }
 try {
  const response=await attempt(()=>fetchWithDeadline(BACKEND+'/api/listings/'+encodeURIComponent(key),8500));
  if(response.status===404)return res.status(404).send('Product not found');
  if(!response.ok)throw Error('Listing API '+response.status);
  const p=await response.json();
  if(!p?._id||!p.title)throw Error('Incomplete listing data');
  // Preserve legacy ID URLs, but point crawlers and customers to the stable slug.
  if(isId(key)&&p.slug&&key!==p.slug)return res.redirect(301,'/products/'+encodeURIComponent(p.slug));
  const shell=await getShell(approvedHost(req.headers?.host));
  const html=renderProductHtml(shell,p);
  if(htmlCache.size>200)htmlCache.delete(htmlCache.keys().next().value);
  htmlCache.set(key,{html,at:Date.now()});
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).send(req.method==='HEAD'?'':html);
 }catch(e){
  console.error('Product SEO API unavailable',e.message);
  if(cached && Date.now()-cached.at<86400000){
   res.setHeader('Content-Type','text/html; charset=utf-8');
   res.setHeader('Warning','110 - "Product SEO response temporarily stale"');
   return res.status(200).send(req.method==='HEAD'?'':cached.html);
  }
  // Never respond 200 with an empty or noindex product when the DB is sleeping.
  res.setHeader('Retry-After','30');res.setHeader('Cache-Control','no-store');
  return res.status(503).send('Product temporarily unavailable; retry later.');
 }
}
