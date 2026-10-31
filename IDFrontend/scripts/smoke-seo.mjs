import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFileSync } from 'node:fs';
import productHandler from '../api/product-seo.js';
import sitemapHandler from '../api/sitemap-products.js';
const id='67b78c2180d7a4d5e21c9af0';
const product={
  _id:id,title:'Premium Laser Cut Wedding Invitation',description:'Custom printed laser-cut wedding invitation with envelopes.',
  images:['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
  quantityPricing:[{minQty:25,price:68}],price:0,
  seoTitle:'Personalized Laser Cut Wedding Cards in Gondia',
};
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const siteMap=readFileSync(new URL('../public/sitemap.xml',import.meta.url),'utf8');
assert(index.includes('id="sk-seo-initial"'),'Homepage initial HTML content missing');
assert(index.includes('structured-data-jsonld'),'Homepage business JSON-LD missing');
assert(siteMap.includes('sitemap-pages.xml')&&siteMap.includes('/api/sitemap-products'),'Sitemap index incomplete');
const landingSlugs=[
  '3d-led-sign-boards-gondia',
  'custom-trophies-awards-gondia',
  'flex-banner-printing-gondia',
];
const sitemapPages=readFileSync(new URL('../public/sitemap-pages.xml',import.meta.url),'utf8');
for(const slug of landingSlugs){
  const html=readFileSync(new URL('../public/'+slug+'/index.html',import.meta.url),'utf8');
  const url='https://www.sanjusk.in/'+slug+'/';
  const title=(html.match(/<title>([^<]+)<\/title>/)||[])[1]?.replace(/&amp;/g,'&') || '';
  const desc=(html.match(/<meta name="description" content="([^"]+)"/)||[])[1]?.replace(/&amp;/g,'&') || '';
  assert(title.length>0&&title.length<60,slug+' title should be below 60 characters');
  assert(desc.length>=140&&desc.length<=155,slug+' meta description must be 140-155 chars');
  assert(html.includes('<link rel="canonical" href="'+url+'">'),slug+' canonical mismatch');
  assert(html.includes('<meta property="og:image"'),slug+' missing social image');
  assert(html.includes('https://wa.me/919372333633?text='),slug+' missing WhatsApp CTA');
  assert(html.includes('tel:+919372333633'),slug+' missing phone CTA');
  assert(html.includes('<iframe'),slug+' missing Maps embed');
  assert(html.includes('Krishnapura Ward'),slug+' missing business address');
  assert(sitemapPages.includes(url),slug+' missing from sitemap pages');
  const json=(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)||[])[1];
  assert(json,slug+' missing JSON-LD');
  const graph=JSON.parse(json)['@graph'];
  const business=graph.find(node=>Array.isArray(node['@type'])&&node['@type'].includes('LocalBusiness'));
  const service=graph.find(node=>node['@type']==='Service');
  const faq=graph.find(node=>node['@type']==='FAQPage');
  assert(business&&business.telephone==='+919372333633',slug+' business schema mismatch');
  assert(service&&service.provider['@id']==='https://www.sanjusk.in/#business',slug+' service schema mismatch');
  assert(faq&&faq.mainEntity.length===4,slug+' must have four FAQ schema questions');
  assert((html.match(/<details>/g)||[]).length===4,slug+' must display four FAQs');
}
const homeSource=readFileSync(new URL('../src/components/Home.jsx',import.meta.url),'utf8');
assert(!homeSource.includes('Our online catalog is temporarily offline'),'Offline copy must never render on home');
const gallerySource=readFileSync(new URL('../src/components/ServiceGallery.jsx',import.meta.url),'utf8');
for(const slug of landingSlugs)assert(gallerySource.includes('/'+slug+'/'),'Service gallery missing '+slug);
const prevFetch=globalThis.fetch;
function mockResponse(){
  return {
    headers:{},code:200,body:undefined,
    setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},
    status(code){this.code=code;return this;},
    send(body){this.body=body;return this;},
    end(){return this;},
    redirect(code,target){this.code=code;this.target=target;return this;},
  };
}
globalThis.fetch=async url=>{
  const str=String(url);
  if(str.includes('/api/listings/'+id))return new Response(JSON.stringify(product),{status:200});
  if(str.endsWith('/api/listings'))return new Response(JSON.stringify([product]),{status:200});
  if(str.endsWith('/'))return new Response(index,{status:200,headers:{'Content-Type':'text/html'}});
  throw Error('Unexpected mocked URL '+str);
};
try {
  const doc=mockResponse();
  await productHandler({method:'GET',query:{id},headers:{host:'www.sanjusk.in'}},doc);
  assert.equal(doc.code,200,'Product endpoint must return 200');
  assert(doc.headers['content-type'].includes('text/html'));
  assert(doc.body.includes('<h1>Premium Laser Cut Wedding Invitation</h1>'),'Crawlable H1 missing');
  assert(doc.body.includes('id="sk-product-schema"'),'Product JSON-LD absent');
  assert(doc.body.includes('"@type":"Product"'),'Product type missing');
  assert(doc.body.includes('"eligibleQuantity"'),'Quantity tier not represented');
  assert(doc.body.includes('rel="canonical" href="https://www.sanjusk.in/products/'+id+'"'),'Canonical wrong');
  assert(!doc.body.includes('id="sk-seo-initial"'),'Homepage text leaked to product HTML');
  const s=mockResponse();
  await sitemapHandler({method:'GET'},s);
  assert.equal(s.code,200);
  assert(s.body.includes('/products/'+id),'Product sitemap missing id');
  assert(!s.body.includes('undefined'),'Invalid sitemap output');
  console.log('SEO smoke tests passed: homepage, Product schema, canonical and live sitemap.');
} finally { globalThis.fetch=prevFetch; }
