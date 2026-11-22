import shared from '../lib/seo-server.cjs';
const {SITE_URL,BACKEND,esc,clean,slugify,safeJson,photoList,productUrl,approvedHost,fetchWithDeadline}=shared;
const SERVICE_LABELS={
 'wedding-card-printing-gondia':'Wedding Cards & Invitations',
 '3d-led-sign-boards-gondia':'LED & Acrylic Sign Boards',
 'custom-trophies-awards-gondia':'Custom Trophies & Awards',
 'flex-banner-printing-gondia':'Flex Banners & Printing',
 'digital-wedding-invitations':'Digital Wedding Invitations',
 'corporate-gifting-gondia':'Corporate Gifting'
};
let cached={data:null,at:0};
const staticCache=new Map();
async function catalogIndex(){
 if(cached.data && Date.now()-cached.at<180000)return cached.data;
 try{
  let r=await fetchWithDeadline(BACKEND+'/api/seo/index',8500);
  if(!r.ok)r=await fetchWithDeadline(BACKEND+'/api/seo/index',12000);
  if(!r.ok)throw Error('SEO catalog '+r.status);
  const body=await r.json();
  if(!Array.isArray(body.products)||!Array.isArray(body.categories))throw Error('Invalid SEO index');
  cached={data:body,at:Date.now()};return body;
 }catch(e){if(cached.data && Date.now()-cached.at<86400000)return cached.data;throw e;}
}
async function template(host,path){
 const key=host+path;
 if(staticCache.has(key))return staticCache.get(key);
 try{
  const r=await fetch('https://'+host+path+'index.html',{signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error('Category static HTML '+r.status);
  const html=await r.text();
  if(!html.includes('</main>')||!html.includes('<head>'))throw Error('Missing static content');
  staticCache.set(key,html);return html;
 }catch(_e){return null;}
}
const serviceMatch={
 'wedding-card-printing-gondia':/wedding|invitation|shaadi|laser.cut/i,
 '3d-led-sign-boards-gondia':/led|acrylic|signage|sign.board|channel.letter|neon/i,
 'custom-trophies-awards-gondia':/troph|award|memento|medal/i,
 'flex-banner-printing-gondia':/flex|banner|hoarding|vinyl|standee/i,
 'digital-wedding-invitations':/digital|invitation|wedding/i,
 'corporate-gifting-gondia':/gift|corporate|award|memento/i
};
function productCategory(p,ids){
 const val=String(p.category?._id||p.category||'');
 return ids.get(val)||String(p.category?.name||'');
}
function generateLinks(rows,category){
 if(!rows.length)return '';
 const cards=rows.map(p=>{
  const img=photoList(p)[0]||'';
  return '<li><a href="'+esc(productUrl(p))+'">'
   +(img?'<img src="'+esc(img)+'" width="170" height="170" loading="lazy" alt="'+esc(p.title)+' - Custom Printing & Design in Gondia">':'')
   +'<span>'+esc(p.title)+'</span></a></li>';
 }).join('');
 const json=safeJson({'@context':'https://schema.org','@graph':[
  {'@type':'ItemList',name:category+' designs',itemListElement:rows.map((p,i)=>({
   '@type':'ListItem',position:i+1,name:clean(p.title),url:productUrl(p)
  }))}
 ]});
 return '<section id="sk-crawlable-design-collection" aria-label="Browse related designs">'
  +'<h2>Explore '+esc(category)+' Designs in Gondia</h2>'
  +'<p>Browse individual design pages, photos and custom printing options.</p>'
  +'<ul class="sk-seo-product-list">'+cards+'</ul></section>'
  +'<style>.sk-seo-product-list{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:12px;margin:1rem 0}.sk-seo-product-list li{border:1px solid #e5dcef;border-radius:12px;overflow:hidden}.sk-seo-product-list a{display:block;text-decoration:none;padding:8px;color:#533a70;font-weight:600}.sk-seo-product-list img{display:block;max-width:100%;height:135px;object-fit:contain;margin:auto}.sk-seo-product-list span{display:block;margin:8px 0}</style>'
  +'<script type="application/ld+json" id="sk-category-items">'+json+'</script>';
}
export default async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method))return res.status(405).end();
 const svc=Array.isArray(req.query.service)?req.query.service[0]:req.query.service;
 const raw=svc||req.query.slug;
 const slug=String(Array.isArray(raw)?raw[0]:raw||'');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>90)return res.status(404).send('Category not found');
 if(svc && !SERVICE_LABELS[slug])return res.status(404).send('Service not found');
 const prefix=svc?'/'+slug+'/':'/categories/'+slug+'/';
 const title=svc?SERVICE_LABELS[slug]:slug.split('-').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');
 const host=approvedHost(req.headers?.host);
 const [staticHtml,items]=await Promise.all([template(host,prefix),catalogIndex().catch(()=>null)]);
 if(!items && !staticHtml){res.setHeader('Retry-After','30');return res.status(503).send('Category temporarily unavailable');}
 const categories=new Map((items?.categories||[]).map(c=>[String(c._id),String(c.name||'')]));
 const matched=(items?.products||[]).filter(p=>{
  const cat=productCategory(p,categories);
  if(svc)return serviceMatch[slug].test(cat+' '+p.title);
  const key=slugify(cat);
  return key===slug||slug.startsWith(key+'-')||key.startsWith(slug+'-');
 });
 const section=generateLinks(matched,title);
 let html;
 if(staticHtml){
  // Retain the existing authored guide/service layout and metadata intact.
  html=staticHtml.replace('</main>',section+'</main>');
 }else{
  const canonical=SITE_URL+prefix;
  const breadcrumb=safeJson({'@context':'https://schema.org','@type':'BreadcrumbList',
   itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:SITE_URL+'/'},
    {'@type':'ListItem',position:2,name:title,item:canonical}
   ]});
  html='<!doctype html><html lang="en"><head><meta charset="UTF-8">'
   +'<meta name="viewport" content="width=device-width, initial-scale=1">'
   +'<title>'+esc(title)+' | SANJU SK Digital Gondia</title>'
   +'<meta name="description" content="Explore '+esc(title)+' designs, custom printing and quotations from SANJU SK Digital in Gondia.">'
   +'<meta name="robots" content="index,follow">'
   +'<link rel="canonical" href="'+esc(canonical)+'">'
   +'<meta property="og:title" content="'+esc(title)+' | SANJU SK Digital Gondia">'
   +'<meta property="og:description" content="Explore custom '+esc(title)+' designs in Gondia.">'
   +'<meta property="og:url" content="'+esc(canonical)+'">'
   +'<meta property="og:image" content="'+SITE_URL+'/images/og-preview.png">'
   +'<meta name="twitter:card" content="summary_large_image">'
   +'<script type="application/ld+json">'+breadcrumb+'</script>'
   +'<link rel="stylesheet" href="/styles/brand-unified.css"></head><body>'
   +'<header><a href="/">SANJU SK Digital · Gondia</a></header><main>'
   +'<nav aria-label="Breadcrumb"><a href="/">Home</a> / '+esc(title)+'</nav>'
   +'<h1>'+esc(title)+' in Gondia</h1>'
   +'<p>Browse real custom designs from SANJU SK Digital, with personalised printing and quotation options.</p>'
   +section+'</main></body></html>';
 }
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control','public, s-maxage=180, stale-while-revalidate=1800');
 return res.status(200).send(req.method==='HEAD'?'':html);
}
