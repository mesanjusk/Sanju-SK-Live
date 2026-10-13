import shared from '../lib/seo-server.cjs';
const { SITE_URL, BACKEND, esc, clean, isId, safeJson, photoList, unitPrice,
  productSchema, productUrl, approvedHost, fetchWithDeadline } = shared;
const remove = (html, pattern) => html.replace(pattern,'');
const TAGS_TO_REMOVE = [
  /<title[^>]*>[\s\S]*?<\/title>/ig,
  /<meta\s+name="description"[^>]*>/ig,
  /<meta\s+name="robots"[^>]*>/ig,
  /<link\s+rel="canonical"[^>]*>/ig,
  /<meta\s+property="og:[^"]+"[^>]*>/ig,
  /<meta\s+name="twitter:[^"]+"[^>]*>/ig,
  /<script\s+type="application\/ld\+json"\s+id="structured-data-jsonld"[^>]*>[\s\S]*?<\/script>/ig,
];
function renderProductHtml(shell, p) {
  const url=productUrl(p._id), title=clean(p.seoTitle||p.title).slice(0,105)+' | SANJU SK Digital, Gondia';
  const desc=clean(p.seoDescription||p.description||`Explore ${p.title} from SANJU SK Digital – Mahi Creation in Gondia. Request a customized quotation on WhatsApp.`).slice(0,165);
  const pics=photoList(p), price=unitPrice(p);
  const json=safeJson({'@context':'https://schema.org','@graph':[
    {'@type':'LocalBusiness','@id':SITE_URL+'/#business','name':'SANJU SK Digital – Mahi Creation',telephone:'+919372333633'},
    productSchema(p),
    {'@type':'WebPage', '@id':url+'#webpage',url,name:title,description:desc,mainEntity:{'@id':url+'#product'}}
  ]});
  const ogImage=pics[0]||SITE_URL+'/images/og-preview.png';
  const head=`
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${esc(ogImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${esc(ogImage)}">
    <script type="application/ld+json" id="sk-product-schema">${json}</script>`;
  const whatsapp=`https://wa.me/919372333633?text=${encodeURIComponent('Hi! Please share a quotation for '+p.title+' (Product ID: '+p._id+').')}`;
  const staticHtml=`<main id="sk-product-initial" aria-label="Product details">
    <nav><a href="/">SANJU SK Digital – Mahi Creation</a> / <a href="/products">Products</a></nav>
    <article><h1>${esc(p.title)}</h1>
    ${pics[0]?`<img src="${esc(pics[0])}" alt="${esc(p.title)}" width="520" height="520" fetchpriority="high">`:''}
    <p>${esc(p.description||'Custom printed and personalized product available on enquiry.')}</p>
    ${price?`<p>Price from ₹${esc(price.price.toFixed(2))} per piece${price.minQty>1?` (minimum ${price.minQty} pieces)`:''}; confirm final quotation.</p>`:'<p>Contact us for a quotation and availability.</p>'}
    <p><a href="${esc(whatsapp)}">Enquire on WhatsApp about ${esc(p.title)}</a></p>
    <p>Designed and supplied by SANJU SK Digital – Mahi Creation, Krishnapura Ward, Gondia, Maharashtra 441601.</p>
    </article></main>`;
  let doc=shell;
  for(const pattern of TAGS_TO_REMOVE) doc=remove(doc,pattern);
  doc=doc.replace('</head>',head+'</head>');
  doc=doc.replace(/<div\s+id="root"\s*>[\s\S]*?<\/div>\s*<script type="module"/i,
    '<div id="root">'+staticHtml+'</div><script type="module"');
  // Root fallback in the current HTML has nested elements, so replace using markers.
  if(!doc.includes('id="sk-product-initial"')) {
    const begin=doc.indexOf('<div id="root">'), finish=doc.indexOf('</div>',doc.indexOf('<!-- SEO STATIC BODY END -->'));
    if(begin>=0&&finish>begin) doc=doc.slice(0,begin)+'<div id="root">'+staticHtml+'</div>'+doc.slice(finish+6);
  }
  if(!doc.includes('id="sk-product-initial"')) {
    doc=doc.replace('<div id="root"></div>','<div id="root">'+staticHtml+'</div>');
  }
  return doc;
}
export default async function handler(req,res) {
  if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).end();
  const id=Array.isArray(req.query.id)?req.query.id[0]:req.query.id;
  if(!isId(id))return res.status(404).send('Product not found');
  const host=approvedHost(req.headers.host);
  try {
    const [pRes,htmlRes]=await Promise.all([
      fetchWithDeadline(BACKEND+'/api/listings/'+id,12500),
      fetch('https://'+host+'/',{signal:AbortSignal.timeout(7000),headers:{'User-Agent':'SanjuSK-SEO-Renderer/1.0'}}),
    ]);
    if(pRes.status===404) return res.status(404).send('Product not found');
    if(!pRes.ok||!htmlRes.ok)throw Error('Product or storefront temporarily unavailable');
    const p=await pRes.json(), shell=await htmlRes.text();
    if(!p?._id||!p.title||!shell.includes('<div id="root">'))throw Error('Incomplete product or SPA HTML');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).send(req.method==='HEAD'?'':renderProductHtml(shell,p));
  } catch(error) {
    console.error('Product SEO fallback',error.message);
    // The product endpoint has not established valid data; never return inaccurate SEO markup.
    // Redirect browsers to the existing SPA route via a safe query flag that bypasses this rewrite.
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Robots-Tag','noindex');
    return res.redirect(307,'/product-view/'+encodeURIComponent(id));
  }
}
