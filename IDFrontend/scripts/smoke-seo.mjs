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
const seoConfig=JSON.parse(readFileSync(new URL('../src/config/local-seo.json',import.meta.url),'utf8'));
const decodeHtml=value=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'"');
const homeTitle=decodeHtml((index.match(/<title>([^<]+)<\/title>/)||[])[1]||'');
const homeDescription=decodeHtml((index.match(/<meta name="description" content="([^"]+)"/)||[])[1]||'');
assert.equal(homeTitle,seoConfig.headline,'Homepage title differs from config');
assert.equal(homeDescription,seoConfig.description,'Homepage description differs from config');
assert.equal(homeTitle,'SANJU SK Digital Gondia | Wedding Cards, Signage & Flex');
assert.equal(homeDescription,"Gondia's trusted studio since 2006 for designer wedding card printing, 3D LED acrylic sign boards, custom trophies & flex banners. Fast delivery across Maharashtra.");
assert(index.includes('<meta name="robots" content="index, follow"'),'Homepage robots must allow indexing');
assert(index.includes('<link rel="canonical" href="https://www.sanjusk.in/"'),'Homepage canonical mismatch');
const homeSchemaText=(index.match(/<script type="application\/ld\+json" id="structured-data-jsonld">([\s\S]*?)<\/script>/)||[])[1];
assert(homeSchemaText,'Homepage JSON-LD not found');
const homeGraph=JSON.parse(homeSchemaText)['@graph'];
const homeBusiness=homeGraph.find(v=>Array.isArray(v['@type'])&&v['@type'].includes('LocalBusiness'));
assert(homeBusiness,'Homepage LocalBusiness schema absent');
assert.equal(homeBusiness['@id'],'https://www.sanjusk.in/#business');
assert.equal(homeBusiness.priceRange,'₹₹');
assert.equal(homeBusiness.geo.latitude,21.4582258);
assert.equal(homeBusiness.geo.longitude,80.189857);
assert.equal(homeBusiness.openingHoursSpecification[0].opens,'10:00');
assert.equal(homeBusiness.openingHoursSpecification[0].closes,'20:00');
for(const place of ['Gondia','Nagpur','Balaghat','Bhandara','Maharashtra'])
  assert(homeBusiness.areaServed.some(p=>p.name===place),'Missing LocalBusiness service area '+place);
assert(siteMap.includes('<urlset'),'Sitemap root must be a URL set');
assert(!siteMap.includes('<sitemapindex'),'Do not publish a sitemap index as the primary sitemap');
const requiredRoutes=[
  ['/', '1.0', 'weekly'],
  ['/wedding-card-printing-gondia/','0.8','monthly'],
  ['/3d-led-sign-boards-gondia/','0.8','monthly'],
  ['/custom-trophies-awards-gondia/','0.8','monthly'],
  ['/flex-banner-printing-gondia/','0.8','monthly'],
];
for(const [route,priority,freq] of requiredRoutes){
  const expected='<loc>https://www.sanjusk.in'+route+'</loc><lastmod>2026-11-01</lastmod><changefreq>'+freq+'</changefreq><priority>'+priority+'</priority>';
  assert(siteMap.includes(expected),'Required sitemap record missing: '+route);
}
const robots=readFileSync(new URL('../public/robots.txt',import.meta.url),'utf8');
assert(robots.includes('User-agent: *')&&robots.includes('Allow: /'),'Robots must allow all crawlers');
assert(robots.includes('Sitemap: https://www.sanjusk.in/sitemap.xml'),'Missing sitemap discovery');
assert(robots.includes('Sitemap: https://www.sanjusk.in/api/sitemap-products'),'Product sitemap not preserved');
const landingSlugs=[
  '3d-led-sign-boards-gondia',
  'custom-trophies-awards-gondia',
  'flex-banner-printing-gondia',
];
const expectedMeta={
  '3d-led-sign-boards-gondia':{
    title:'3D LED Sign Boards & Acrylic Letters in Gondia | SANJU SK',
    desc:'Custom illuminated 3D LED letters, acrylic neon signs & shop front glow boards in Gondia. Durable, weather-proof signage by SANJU SK Digital.',
  },
  'custom-trophies-awards-gondia':{
    title:'Custom Trophies, Awards & Mementos in Gondia | SANJU SK',
    desc:'Order personalized wooden, acrylic, metal & crystal trophies, mementos & sports awards in Gondia. Fast engraving & bulk delivery by SANJU SK Digital.',
  },
  'flex-banner-printing-gondia':{
    title:'Flex Banner & Hoarding Printing in Gondia | SANJU SK',
    desc:'High-resolution outdoor flex banners, hoardings, standees & vinyl printing in Gondia. Same-day & express printing services by SANJU SK Digital.',
  },
};
const sitemapPages=readFileSync(new URL('../public/sitemap-pages.xml',import.meta.url),'utf8');
for(const slug of landingSlugs){
  const html=readFileSync(new URL('../public/'+slug+'/index.html',import.meta.url),'utf8');
  const url='https://www.sanjusk.in/'+slug+'/';
  const title=(html.match(/<title>([^<]+)<\/title>/)||[])[1]?.replace(/&amp;/g,'&') || '';
  const desc=(html.match(/<meta name="description" content="([^"]+)"/)||[])[1]?.replace(/&amp;/g,'&') || '';
  assert.equal(title,expectedMeta[slug].title,slug+' title mismatch');
  assert(title.length>0&&title.length<60,slug+' title should be below 60 characters');
  assert.equal(desc,expectedMeta[slug].desc,slug+' description mismatch');
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
  assert.equal(business.priceRange,'₹₹',slug+' priceRange mismatch');
  assert.equal(service.description,expectedMeta[slug].desc,slug+' service description mismatch');
  assert(faq&&faq.mainEntity.length===4,slug+' must have four FAQ schema questions');
  assert((html.match(/<details>/g)||[]).length===4,slug+' must display four FAQs');
}
const hostRedirect=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8')).redirects[0];
assert.equal(hostRedirect.statusCode,301,'Apex domain must use explicit 301');
assert.equal(hostRedirect.has[0].value,'sanjusk.in','Redirect must only match apex host');
assert.equal(hostRedirect.destination,'https://www.sanjusk.in/:path*','Apex redirect must target secure www');
const homeSource=readFileSync(new URL('../src/components/Home.jsx',import.meta.url),'utf8');
assert(!homeSource.includes('Our online catalog is temporarily offline'),'Offline copy must never render on home');
const gallerySource=readFileSync(new URL('../src/components/ServiceGallery.jsx',import.meta.url),'utf8');
for(const slug of landingSlugs)assert(gallerySource.includes('/'+slug+'/'),'Service gallery missing '+slug);
const heroSource=readFileSync(new URL('../src/components/mobile/FestiveStorefrontHero.jsx',import.meta.url),'utf8');
const cardSource=readFileSync(new URL('../src/components/mobile/CompactProductCard.jsx',import.meta.url),'utf8');
const carouselSource=readFileSync(new URL('../src/components/mobile/CategoryProductCarousel.jsx',import.meta.url),'utf8');
const bottomNavSource=readFileSync(new URL('../src/components/mobile/MobileBottomNav.jsx',import.meta.url),'utf8');
const categorySource=readFileSync(new URL('../src/components/mobile/StoryCategories.jsx',import.meta.url),'utf8');
const reminderSource=readFileSync(new URL('../src/components/mobile/CallReminder.jsx',import.meta.url),'utf8');
const appSource=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
assert(homeSource.includes('<details id="sk-business-information"'),'Expandable business information missing');
assert(homeSource.includes('<FAQSection />')&&homeSource.includes('<LocalContactFooter />'),'FAQs and contact must remain in the page');
assert(homeSource.includes('groupedProducts')&&homeSource.includes('<CategoryProductCarousel section='),'Swipeable category previews missing');
assert(!homeSource.includes('<StoryCategories') && !heroSource.includes('sk-festive-tabs sk-festive-container'),'Remove duplicate category strips; collections carousel owns category browsing');
assert(carouselSource.includes('calc((100% - 16px) / 3)')&&carouselSource.includes('onScroll={onScroll}'),'Three-across lazy swipe gallery missing');
assert(homeSource.includes('filteredProducts.slice(0, visibleCount)'),'Focused product pagination missing');
assert(heroSource.includes('phoneNumber')&&heroSource.includes('dialHref'),'Top navigation call link missing');
assert(cardSource.includes('loading="lazy"')&&cardSource.includes('Enquire'),'Lightweight product gallery card missing');
assert(heroSource.includes('FaEllipsisV')&&heroSource.includes('sk-top-navigation'),'Three-dot website menu missing');
const festiveCss=readFileSync(new URL('../src/components/mobile/festive-home.css',import.meta.url),'utf8');
assert(heroSource.includes('sk-festive-tile-top')&&heroSource.includes('sk-festive-tile-media'),'Collection photo and label must have separate layout regions');
assert(festiveCss.includes('grid-auto-columns:44%'),'Video-style carousel should show about two large cards plus a peek of next');
assert(festiveCss.includes('.sk-festive-tile-media img')&&festiveCss.includes('position: static'),'Collection photo must stay within its own media region');
assert(bottomNavSource.includes('fixed right-2')&&bottomNavSource.includes('h-10 w-10'),'Contact dock must stay compact and right-aligned');
assert(heroSource.includes('Made with <FaHeart')&&heroSource.includes('sk-festive-top-phone'),'One-line heart and phone information missing');
assert(bottomNavSource.includes('FaWhatsapp')&&bottomNavSource.includes('FaPhoneAlt')&&bottomNavSource.includes('FaHeart'),'Three floating contact icons missing');
assert(reminderSource.includes('FIRST_REMINDER_DELAY_MS = 15000')&&reminderSource.includes('REPEAT_REMINDER_DELAY_MS = 8000'),'Call reminder timing must be 15 seconds then every 8 seconds');
assert(reminderSource.includes('top-1/2')&&reminderSource.includes('w-[178px]'),'Call reminder must stay narrow at right-center');
assert(reminderSource.includes('sessionStorage.setItem(DISMISSED_KEY'),'Call reminders must be dismissible for the session');
assert(appSource.includes('<CallReminder />'),'Call reminders must work across public routes');

assert(heroSource.includes('sk-festive-header-search') && heroSource.indexOf('sk-festive-header-search') < heroSource.indexOf('sk-festive-header-actions relative'), 'Search must sit in the top navigation before the three-dot menu');
assert(!heroSource.includes('sk-festive-search" role="search"'), 'Full-width search row must be removed');
assert(heroSource.includes('collections.map(item => renderTile(item))'), 'All collection cards must be swipeable, not only first four');
assert(festiveCss.includes('grid-auto-columns:44%'), 'Use video-style collection card sizing on mobile');
assert(festiveCss.includes('/* Light-lavender homepage palette') && festiveCss.includes('#efe6fb'), 'Light lavender palette required across homepage');
assert(homeSource.indexOf('<ServiceGallery />') > homeSource.indexOf('</main>'), 'Product catalog should precede signature services');
assert(homeSource.includes('group-open:block'), 'Business information panel must remain compact until opened');

assert(!heroSource.includes('Explore designs'), 'Hero Explore designs button must be removed');
assert(heroSource.includes('ref={carouselRef}') && heroSource.includes('onTouchStart={pauseCarousel}'), 'Swipe carousel must pause on user input');
assert(heroSource.includes('window.requestAnimationFrame(move)') && heroSource.includes('prefers-reduced-motion: reduce'), 'Carousel autoplay and reduced-motion support required');
assert(heroSource.includes('collections.map(item => renderTile(item))'), 'All real catalog categories should be accessible in the collection carousel');
assert(!heroSource.includes('const renderTab ='), 'Old top category icon navigation must be deleted');
const browserHTML=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(browserHTML.includes('<meta name="theme-color" content="#EFE6FB" />'),'Browser theme should match lavender website');
assert(heroSource.includes('window.requestAnimationFrame(move)') && heroSource.includes('window.cancelAnimationFrame(frameId)'),'Carousel animation must clean up animation frames');
assert(heroSource.includes('collections.map(item => renderTile(item, true))'),'Carousel needs a duplicated visual sequence for seamless looping');
assert(heroSource.includes('prefers-reduced-motion: reduce') && heroSource.includes('onPointerDown={pauseCarousel}'),'Autoscroll must respect reduced motion and manual interaction');
assert(festiveCss.includes('/* Promotional, image-first carousel') && festiveCss.includes('object-fit:cover'),'Carousel must use large photo-led cards');
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
