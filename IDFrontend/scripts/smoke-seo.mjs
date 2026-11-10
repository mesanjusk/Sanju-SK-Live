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
const appBootSource=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
assert(appBootSource.includes("import Home from './components/Home'"), 'Homepage must render directly instead of flashing the suspense loader');
assert(!appBootSource.includes("lazy(() => import('./components/Home'))"), 'Do not lazy load homepage behind a second skeleton');
assert(index.includes('sk-pre-pin-header') && index.includes('sk-pre-pin-masonry'), 'Pinterest first paint must be image-first');
assert(index.includes('sk-pre-pin-more') && index.includes('Get a custom quote on WhatsApp'), 'SEO footer must retain quotation action');
assert(index.indexOf('sk-pre-pin-more') > index.indexOf('sk-pre-pin-masonry'), 'Gondia studio prose must move below the masonry feed');
assert(index.includes('<details class="sk-pre-pin-more">') && index.includes('Common questions'), 'Initial SEO footer content must remain without JS');
assert(index.includes('class="sk-pre-pin-item sk-pre-pin-item-0"') && index.includes('images/services/wedding-cards.svg'), 'Initial masonry links and images must be present');
assert(index.includes('sk-initial-seo-style') && index.includes('background:#fff'), 'Pinterest first paint should have a white background');
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
assert(robots.includes('Sitemap: https://www.sanjusk.in/sitemap-products.xml'),'Product sitemap discovery must use the direct XML route');
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
const pinterestHeaderSource=readFileSync(new URL('../src/components/mobile/PinterestHeader.jsx',import.meta.url),'utf8');
const pinterestPinSource=readFileSync(new URL('../src/components/mobile/PinterestPin.jsx',import.meta.url),'utf8');
const pinterestCss=readFileSync(new URL('../src/components/mobile/pinterest-home.css',import.meta.url),'utf8');
const productDetailSource=readFileSync(new URL('../src/pages/ProductDetail.jsx',import.meta.url),'utf8');
assert(homeSource.includes('<PinterestHeader') && homeSource.includes('sk-pinterest-masonry'), 'Pinterest homepage header and masonry feed required');
assert(homeSource.includes('feedProducts.slice(0, visibleCount)'), 'Masonry feed needs bounded infinite loading');
assert(homeSource.includes('categoryById') && homeSource.includes('selectedCategory'), 'Category filtering must remain connected to live data');
assert(pinterestHeaderSource.includes('role="tablist"') && pinterestHeaderSource.includes('aria-selected'), 'Swipeable category tabs must be accessible');
assert(pinterestHeaderSource.includes('sk-pinterest-search') && pinterestHeaderSource.includes('disabled={!catalogReady}'), 'Search must wait for database readiness');
assert(pinterestPinSource.includes("'/products/'") && pinterestPinSource.includes('toggleFavorite(product)'), 'Pins must open product details and save');
assert(pinterestPinSource.includes('trackWhatsAppClick') && pinterestPinSource.includes('saveEnquiryLead'), 'Pin enquiries must preserve lead tracking');
assert(pinterestPinSource.includes('navigator.share') && pinterestPinSource.includes('sk-pin-more'), 'Pins must have overflow sharing actions');
assert(pinterestCss.includes('columns:2') && pinterestCss.includes('break-inside:avoid'), 'Two column masonry on mobile required');
assert(pinterestCss.includes('columns:3') && pinterestCss.includes('columns:4'), 'Masonry must expand on larger screens');
assert(bottomNavSource.includes('FaHome') && bottomNavSource.includes('FaSearch') && bottomNavSource.includes('FaUserCircle'), 'Pinterest-inspired dock required');
assert(bottomNavSource.includes('is-hidden') && homeSource.includes('setShowBottomNav'), 'Scroll-aware floating dock retained');
assert(productDetailSource.includes('sk-pin-related') && productDetailSource.includes('<PinterestPin'), 'Product click must offer related inspiration');
assert(productDetailSource.includes('toggleFavorite(product)') && productDetailSource.includes('handleShare') && productDetailSource.includes('handleWAClick'), 'Detail save, share and WhatsApp actions preserved');
assert(homeSource.includes('sk-pinterest-seo-intro') && homeSource.includes('GONDIA DESIGN STUDIO · SINCE 2006'), 'Gondia hero copy moved into expandable footer');
assert(homeSource.indexOf('sk-pinterest-seo-intro') > homeSource.indexOf('sk-store-footer-expanded'), 'SEO copy only inside expanded footer');
assert(homeSource.includes('<FAQSection />') && homeSource.includes('<LocalContactFooter />') && homeSource.includes('<ServiceGallery />'), 'Services, FAQ and local contact preserved');
assert(index.includes('sk-pre-pin-bottom') && index.includes('sk-pre-pin-tabs'), 'Static first paint must match Pinterest-style layout');
const festiveCss=readFileSync(new URL('../src/components/mobile/festive-home.css',import.meta.url),'utf8');
const heroSource=readFileSync(new URL('../src/components/mobile/FestiveStorefrontHero.jsx',import.meta.url),'utf8');
const reminderSource=readFileSync(new URL('../src/components/mobile/CallReminder.jsx',import.meta.url),'utf8');
const appSource=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
assert(appSource.includes('<CallReminder />'),'Public contact reminder must remain available');
assert(reminderSource.includes('sessionStorage.setItem(DISMISSED_KEY'),'Call reminder must remain dismissible');
assert(homeSource.includes('<CatalogLoadingState error={catalogFailed && !catalogPending} onRetry={retryCatalog} />'), 'Load/retry animation must remain in gallery');
assert(!homeSource.includes('Our online catalog is temporarily offline'),'Do not show misleading offline copy');

const categoryGuideData=JSON.parse(readFileSync(new URL('../src/config/category-seo.json',import.meta.url),'utf8'));
const guideSource=readFileSync(new URL('../src/components/mobile/CategorySeoBlurb.jsx',import.meta.url),'utf8');
const navSource=readFileSync(new URL('../src/components/mobile/MobileBottomNav.jsx',import.meta.url),'utf8');
const vercelRules=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
assert(categoryGuideData.length>=9,'Require authored category content for observed catalog categories');
assert(new Set(categoryGuideData.map(g=>g.slug)).size===categoryGuideData.length,'Category SEO guide slugs must be unique');
assert(homeSource.includes('<CategorySeoBlurb name={selectedCategory.name} />'),
  'SEO summary must follow each actual live category and focused selection');
assert(guideSource.includes('getCategoryGuide') && guideSource.includes('Browse ' + "' + name + '"),
  'Every unknown live category needs a relevant no-fabrication fallback description');
assert(pinterestCss.includes('.sk-pin-bottom-dock'), 'Floating Pinterest-style bottom dock required');
assert(navSource.includes('visible = true') && navSource.includes('is-hidden'), 'Floating dock must respond to scroll state');
const newPages=categoryGuideData.filter(g=>!g.existingUrl);
assert(newPages.length>=7,'Require new helpful indexable pages in addition to existing service pages');
assert(vercelRules.rewrites.some(r=>r.source==='/categories/:slug/' && r.destination==='/categories/:slug/index.html'),
  'Vercel must serve generated category pages rather than React fallback');
for(const guide of newPages) {
  const canonical='https://www.sanjusk.in/categories/'+guide.slug+'/';
  const html=readFileSync(new URL('../public/categories/'+guide.slug+'/index.html',import.meta.url),'utf8');
  assert(html.includes('<title>'+guide.title.replace(/&/g,'&amp;')+'</title>'),guide.slug+' title missing');
  assert(html.includes('<meta name="description"'),guide.slug+' missing description');
  assert(html.includes('<link rel="canonical" href="'+canonical+'">'),guide.slug+' canonical missing');
  assert(html.includes('<h1>') && html.includes('in Gondia</h1>'),guide.slug+' unique H1 missing');
  assert(html.includes('Krishnapura Ward') && html.includes('tel:+919372333633'),guide.slug+' business details missing');
  assert(html.includes('Request a quotation') && html.includes('Browse '+guide.name+' products'),guide.slug+' enquiry or products link missing');
  assert(html.includes('<nav class="links"'),guide.slug+' internal category links missing');
  const schemaText=(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)||[])[1];
  assert(schemaText,guide.slug+' JSON-LD absent');
  const graph=JSON.parse(schemaText)['@graph'];
  assert(graph.some(node=>node['@type']==='CollectionPage'),guide.slug+' CollectionPage schema missing');
  assert(graph.some(node=>node['@type']==='BreadcrumbList'),guide.slug+' breadcrumb schema missing');
  assert(!graph.some(node=>node['@type']==='Product'),guide.slug+' must not use Product rich-result schema for a category list');
  assert(siteMap.includes('<loc>'+canonical+'</loc><lastmod>2026-11-03</lastmod>'),guide.slug+' sitemap entry missing');
}
for(const guide of categoryGuideData) {
  const path=guide.existingUrl || '/categories/'+guide.slug+'/';
  assert(index.includes('href="'+path+'"'),guide.slug+' missing homepage crawlable internal link');
}

const loadingComponentSource=readFileSync(new URL('../src/components/mobile/CatalogLoadingState.jsx',import.meta.url),'utf8');
assert(homeSource.includes("catalogStatus") && homeSource.includes("catalogReady") && homeSource.includes("catalogPending") && homeSource.includes("catalogFailed"),
  'Category and listing endpoints must track separate loading outcomes');
assert(homeSource.includes("loadCatalogPart('listings'") && homeSource.includes("loadCatalogPart('categories'"),
  'Loading state must wait for the two live catalog resources');
assert(homeSource.includes("if (!catalogReady) return;"), 'Category actions must be gated until the catalog is ready');
assert(homeSource.includes('<CatalogLoadingState error={catalogFailed && !catalogPending} onRetry={retryCatalog} />'),
  'Show printing animation during pending state and manual retry after failure');
assert(pinterestHeaderSource.includes('disabled={!catalogReady}') && pinterestHeaderSource.includes('catalogReady'), 'Pinterest category/search actions must respect catalog loading');
assert(homeSource.includes('<CatalogLoadingState error={catalogFailed && !catalogPending}'), 'Printing loader must replace unready masonry feed');
assert(loadingComponentSource.includes('sk-print-press') && loadingComponentSource.includes('sk-print-paper') &&
  loadingComponentSource.includes('Try loading again'), 'Loader must use printing motif and an accessible retry');
assert(festiveCss.includes('@keyframes sk-paper-print') && festiveCss.includes('@media (prefers-reduced-motion:reduce)'),
  'CSS-only print animation must respect reduced-motion settings');

const routeMetaSource=readFileSync(new URL('../src/config/routeMeta.js',import.meta.url),'utf8');
const sitemapXmlRoutes=siteMap;
assert(!sitemapXmlRoutes.includes('https://www.sanjusk.in/home1') &&
       !sitemapXmlRoutes.includes('https://www.sanjusk.in/allListing'),
  'Legacy duplicate browse routes must not appear in the canonical sitemap');
assert(routeMetaSource.includes("'/home1': {") && routeMetaSource.includes("'/allListing': {") &&
  routeMetaSource.includes('Legacy product listings; see the current product gallery instead.') &&
  routeMetaSource.includes('Legacy wedding collection page; see current wedding services.') &&
  (routeMetaSource.match(/noIndex: true/g) || []).length >= 2,
  'Legacy duplicated routes should be non-indexable but remain functional');
assert(vercelRules.rewrites.some(r=>r.source==='/sitemap-products.xml' && r.destination==='/api/sitemap-products'),
  'Product XML sitemap must be a rewrite returning XML without a temporary redirect');
assert(!vercelRules.redirects.some(r=>r.source==='/sitemap-products.xml'),
  'Do not redirect the product sitemap to a different crawl URL');
const robotsContent=readFileSync(new URL('../public/robots.txt',import.meta.url),'utf8');
assert(robotsContent.includes('Sitemap: https://www.sanjusk.in/sitemap-products.xml'),
  'Robots should advertise the canonical product XML sitemap path');
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
