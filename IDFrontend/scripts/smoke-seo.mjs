import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFileSync } from 'node:fs';
import productHandler from '../api/product-seo.js';
import sitemapHandler from '../api/sitemap-products.js';
import { uniqueDesigns, designId } from '../src/components/mobile/uniqueDesigns.mjs';
import {rankDesigns,similarityScore} from '../src/components/mobile/interestRank.mjs';
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
assert(index.includes('class="sk-boot-header sk-boot-container"') && index.includes('class="sk-boot-hero'), 'Homepage initial HTML must match lavender storefront layout');
assert(index.includes('class="sk-boot-hero-cta"') && index.includes('class="sk-boot-collections"'), 'Initial HTML must include unified quote CTA before collections');
assert(index.indexOf('sk-boot-collections') < index.indexOf('GONDIA DESIGN STUDIO · SINCE 2006'),
  'The Pinterest gallery must appear before the SEO studio intro tucked into More about');
assert(index.includes('<details class="sk-boot-more"><summary>More about SANJU SK Digital</summary>') &&
  index.includes('Common questions'), 'Initial SEO business information must remain available inside More about without JS');
assert(index.includes('class="sk-boot-card"') && index.includes('images/services/wedding-cards.svg'), 'Initial collection links and images must be present');
assert(index.includes('sk-initial-seo-style') && index.includes('#f8f3fc'), 'First paint needs lavender background instead of old green fallback');
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
const pinHeaderSource=readFileSync(new URL('../src/components/mobile/PinterestStorefrontHeader.jsx',import.meta.url),'utf8');
const pinCardSource=readFileSync(new URL('../src/components/mobile/PinterestPinCard.jsx',import.meta.url),'utf8');
const pinCss=readFileSync(new URL('../src/components/mobile/pinterest-storefront.css',import.meta.url),'utf8');
const detailSource=readFileSync(new URL('../src/pages/ProductDetail.jsx',import.meta.url),'utf8');
const pinNavSource=readFileSync(new URL('../src/components/mobile/MobileBottomNav.jsx',import.meta.url),'utf8');
const reminderSource=readFileSync(new URL('../src/components/mobile/CallReminder.jsx',import.meta.url),'utf8');
const appSource=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const festiveCss=readFileSync(new URL('../src/components/mobile/festive-home.css',import.meta.url),'utf8');

assert(homeSource.includes('<PinterestStorefrontHeader') && homeSource.includes('<EndlessPinterestFeed') &&
  homeSource.includes('filteredProducts'), 'Homepage must use Pinterest header and endlessly looping real product masonry');
assert(!homeSource.includes('<FestiveStorefrontHero') && !homeSource.includes('<CategoryProductCarousel'),
  'Previous promotional hero and grouped category carousels must not render');
assert(pinHeaderSource.includes('sk-pin-categories') && pinHeaderSource.includes('onCategorySelect?.(cat)') &&
  pinHeaderSource.includes('aria-pressed='), 'Horizontal category tabs must filter actual database categories');
assert(pinHeaderSource.includes('sk-pin-search-row') && pinHeaderSource.includes('disabled={!catalogReady}'),
  'Search should open on demand and remain safe before database loads');
assert(pinHeaderSource.includes('sk-pin-top-action') && pinHeaderSource.includes('sk-pin-overflow-menu'),
  'Header must have custom quote action and functional overflow menu');
assert(pinCardSource.includes("to={url} state={{ product }}") && pinCardSource.includes('sk-pin-cover') &&
  pinCardSource.includes('sk-pin-shape-'), 'Tapping a mosaic tile must enter its real product URL with instant preview state');
assert(pinCardSource.includes('toggleFavorite(product)') && pinCardSource.includes('saveEnquiryLead') &&
  pinCardSource.includes('Copy link') && pinCardSource.includes('Request quote'),
  'Pin action menu must save, copy and enquire about actual product');
assert(pinCss.includes('columns:2') && pinCss.includes('break-inside:avoid') &&
  pinCss.includes('sk-pin-cover') && pinCss.includes('sk-pin-detail-related'),
  'Two-column mobile masonry and related designs styling must exist');
assert(pinCss.includes('prefers-reduced-motion:reduce'), 'Motion accessibility must be retained');
const endlessSource=readFileSync(new URL('../src/components/mobile/EndlessPinterestFeed.jsx',import.meta.url),'utf8');
const loadingSource=readFileSync(new URL('../src/components/mobile/CatalogLoadingState.jsx',import.meta.url),'utf8');
assert(endlessSource.includes('uniqueDesigns') && endlessSource.includes('IntersectionObserver') &&
  endlessSource.includes('uniqueProducts.slice(0, visibleCount)') &&
  endlessSource.includes('BATCH_SIZE = 18'),
  'Pinterest feed must show unique designs in progressive, finite batches');
assert(!endlessSource.includes('shuffleNextCycle') && !endlessSource.includes('cursor.cycle'),
  'Do not reintroduce repeated shuffled design cycles');
assert(!endlessSource.includes("You've seen all") &&
  !endlessSource.includes('Explore another category') &&
  endlessSource.includes(') : null}'),
  'End the feed silently without repeating designs or showing a count banner');
const duplicates=[
  {_id:'A',images:['https://res.cloudinary.com/demo/image/upload/v1/card.jpg']},
  {_id:'B',images:['https://res.cloudinary.com/demo/image/upload/v1/card.jpg?width=400']},
  {_id:'A',images:['https://res.cloudinary.com/demo/image/upload/v1/other.jpg']},
  {_id:'C',images:['https://res.cloudinary.com/demo/image/upload/v2/third.jpg']},
  {_id:'D',images:['https://res.cloudinary.com/demo/image/upload/v2/third.jpg#frag']},
  {_id:'E',images:[]},
  {_id:'F',images:[]},
  {_id:'',images:['https://res.cloudinary.com/demo/image/upload/v3/missing.jpg']},
];
const unique=uniqueDesigns(duplicates);
assert.deepEqual(unique.map(designId),['A','C','E','F'],
  'Remove repeated IDs and duplicate cover artwork, preserving designs without pictures');
assert.equal(new Set(unique.map(designId)).size,unique.length,
  'No design ID should repeat in the gallery');
assert(homeSource.includes('distinctProducts.length') && homeSource.includes('products={orderedProducts}'),
  'The visible design count and feed must use deduplicated products');
assert(detailSource.includes('uniqueDesigns(products.filter('),
  'Related designs must not repeat identical catalog artwork');
assert(loadingSource.includes('/images/sk-digital-final.svg') &&
  !loadingSource.includes('sk-print-press-mark'),
  'Loading animation must show the finalized SK logo, not placeholder letters');
assert(reminderSource.includes('sk-pin-call-reminder') &&
  reminderSource.includes('/images/sk-digital-final.svg'),
  'Call popup must use the same real SK monogram and unified layout');
assert(pinCss.includes('--sk-brand-accent:#b16a0e') &&
  pinCss.includes('.sk-pinterest-home .sk-catalog-loading') &&
  pinCss.includes('.sk-pin-call-reminder'),
  'Loading, logo and call popup must share charcoal/white/gold theme');
assert(pinHeaderSource.includes('<FaWhatsapp aria-hidden="true"/>') && !pinHeaderSource.includes('<FaPlus'),
  'Header custom design action must show WhatsApp, not a plus');
assert(pinHeaderSource.includes('sk-pin-brand-final-logo') &&
  homeSource.includes('sk-store-footer-final-logo'), 'Use the final SK logo in header and footer');
const finalLogo=readFileSync(new URL('../public/images/sk-digital-final.svg',import.meta.url),'utf8');
assert(finalLogo.includes('viewBox="0 0 590 429"') &&
  finalLogo.includes('fill-rule="evenodd"'), 'Finalized monogram SVG asset missing');
assert(index.includes('sk-boot-real-logo') && index.includes('sk-boot-whatsapp-link') &&
  index.includes('href="/images/sk-digital-final.svg"'), 'SEO initial paint must show the real logo and WhatsApp link');
assert(homeSource.indexOf('sk-pin-about-intro') > homeSource.indexOf('sk-store-footer-expanded') &&
  homeSource.includes('GONDIA DESIGN STUDIO · SINCE 2006') &&
  homeSource.includes('Wedding cards, signage &amp;'),
  'Gondia SEO heading and descriptive text must move into expandable footer');
assert(homeSource.includes('<ServiceGallery />') && homeSource.includes('<FAQSection />') &&
  homeSource.includes('<LocalContactFooter />'), 'Service links, FAQs and contact must survive redesign');
assert(pinNavSource.includes("variant === 'pinterest'") && pinNavSource.includes('FaHome') &&
  pinNavSource.includes('FaSearch') && pinNavSource.includes('FaHeart') &&
  pinNavSource.includes('sk-pin-bottom-nav'), 'Floating dock must offer Home Search and Saved');
assert(pinNavSource.includes('FaWhatsapp') && pinNavSource.includes('FaPhoneAlt') &&
  pinNavSource.includes('is-hidden'), 'Existing contact mode and auto-hide support must remain intact');
assert(detailSource.includes('sk-pin-detail-visual') && detailSource.includes('sk-pin-detail-thumbs') &&
  detailSource.includes('More ideas like this') && detailSource.includes('sk-pin-detail-related'),
  'Product click should show immersive photo gallery and related designs');
assert(detailSource.includes('ProductStructuredData') && detailSource.includes('saveEnquiryLead') &&
  detailSource.includes('toggleFavorite(product)') && detailSource.includes('navigator.share') &&
  detailSource.includes('getPriceForQty'), 'Details must retain SEO, saved, sharing and genuine pricing');
assert(detailSource.includes('initial = idOf(location.state?.product)') &&
  detailSource.includes("api.get('/api/listings/' + id"), 'Detail should render immediately using card state and refresh from backend');
assert(detailSource.includes('ProductStage') && detailSource.includes('getYouTubeId'),
  'Optional 3D model and video media features should remain');
assert(pinCss.includes('sk-pin-about-intro') && index.includes('sk-boot-bottom-nav'),
  'Both first paint and React layout must use Pinterest-inspired navigation');
assert(!homeSource.includes('sk-back-to-top') && !homeSource.includes('pb-24'),
  'No floating Top button or excessive bottom whitespace');
assert(reminderSource.includes('FIRST_REMINDER_DELAY_MS = 15000') &&
  reminderSource.includes('REPEAT_REMINDER_DELAY_MS = 8000') &&
  reminderSource.includes('sessionStorage.setItem(DISMISSED_KEY'),
  'Dismissible call reminder must remain available');
assert(appSource.includes('<CallReminder />'), 'Call reminders must work on public routes');

const categoryGuideData=JSON.parse(readFileSync(new URL('../src/config/category-seo.json',import.meta.url),'utf8'));
const guideSource=readFileSync(new URL('../src/components/mobile/CategorySeoBlurb.jsx',import.meta.url),'utf8');
const navSource=readFileSync(new URL('../src/components/mobile/MobileBottomNav.jsx',import.meta.url),'utf8');
const vercelRules=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
assert(categoryGuideData.length>=9,'Require authored category content for observed catalog categories');
assert(new Set(categoryGuideData.map(g=>g.slug)).size===categoryGuideData.length,'Category SEO guide slugs must be unique');
assert(homeSource.includes('<CategorySeoBlurb name={selectedCategory.name} />') &&
  endlessSource.includes('categoryById.get(itemKey(product.category))'),
  'SEO summary and category resolution must work for selected catalog categories');
assert(guideSource.includes('getCategoryGuide') && guideSource.includes('Browse ' + "' + name + '"),
  'Every unknown live category needs a relevant no-fabrication fallback description');
assert(festiveCss.includes('Floating three-icon dock') && pinCss.includes('.sk-pin-bottom-nav'),
  'Keep a floating quick dock, updated to Home Search Saved for Pinterest view');
assert(navSource.includes('sk-floating-actions') && navSource.includes('visible = true'),
  'Floating actions must keep scroll-aware show/hide state');
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
assert(pinHeaderSource.includes('disabled={!catalogReady}') && pinHeaderSource.includes('sk-pin-tab-loading'),
  'Search and category tabs must be non-interactive while waiting for catalog data');
assert(homeSource.includes('<CatalogLoadingState error={catalogFailed && !catalogPending} onRetry={retryCatalog} />'),
  'CSS print animation must replace the masonry gallery while metadata or products are pending');
assert(loadingComponentSource.includes('sk-print-press') && loadingComponentSource.includes('sk-print-paper') &&
  loadingComponentSource.includes('Try loading again'), 'Loader must use printing motif and an accessible retry');
assert(festiveCss.includes('@keyframes sk-paper-print') && festiveCss.includes('@media (prefers-reduced-motion:reduce)'),
  'CSS-only print animation must respect reduced-motion settings');


const rankedSample=[
  {_id:'a',category:'wedding',title:'Rose wedding invitation',description:'laser cut'},
  {_id:'b',category:'wedding',title:'Traditional floral invite',description:'laser cut'},
  {_id:'c',category:'signage',title:'Gold acrylic sign',description:'outdoor'},
  {_id:'d',category:'trophies',title:'School trophy',description:'awards'},
  {_id:'e',category:'birthday',title:'Birthday invitation',description:'balloons'},
  {_id:'f',category:'gifts',title:'Gift box',description:'hamper'},
];
const selected=[{id:'a',category:'wedding',title:'Rose wedding invitation',description:'laser cut',weight:1}];
assert(similarityScore(rankedSample[1],selected)>similarityScore(rankedSample[3],selected),
  'Similar wedding designs should outrank unrelated products after selection');
const shuffleA=rankDesigns(rankedSample,{seed:'a1'}).map(p=>p._id);
const shuffleB=rankDesigns(rankedSample,{seed:'b2'}).map(p=>p._id);
assert.notDeepEqual(shuffleA,shuffleB,'Different visitor seeds should change the initial product order');
assert.deepEqual(rankDesigns(rankedSample,{seed:'a1'}).map(p=>p._id),shuffleA,
  'Within a page visit, product positions must remain stable until interactions change');
assert(homeSource.includes('freshFeedSeed')&&homeSource.includes('getDesignInterests')&&
  homeSource.includes("fetch('/api/recommendations'"),
  'Use per-refresh shuffling and optional Gemini reranking, retaining local fallback');
assert(pinCardSource.includes('recordDesignInterest')&&detailSource.includes('recordDesignInterest'),
  'Clicked, saved and opened designs must inform future recommendations');
const geminiEndpoint=readFileSync(new URL('../api/recommendations.js',import.meta.url),'utf8');
assert(geminiEndpoint.includes('process.env.GEMINI_API_KEY') &&
  geminiEndpoint.includes("mode:'local'") && geminiEndpoint.includes('x-goog-api-key') &&
  geminiEndpoint.includes('allowed.has(id)'),
  'Gemini must run server-side, limit results to real catalog IDs, and fall back without an API key');
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

const sharedTheme=readFileSync(new URL('../src/styles/public-theme.css',import.meta.url),'utf8');
const innerHeader=readFileSync(new URL('../src/components/mobile/MobileHeader.jsx',import.meta.url),'utf8');
const savedMasonryPage=readFileSync(new URL('../src/components/Favorites.jsx',import.meta.url),'utf8');
const favoritesContext=readFileSync(new URL('../src/context/FavoritesContext.jsx',import.meta.url),'utf8');
const catalogPage=readFileSync(new URL('../src/pages/ProductListing.jsx',import.meta.url),'utf8');
const categoryListPage=readFileSync(new URL('../src/components/allCategory.jsx',import.meta.url),'utf8');
const contactPage=readFileSync(new URL('../src/components/Contact.jsx',import.meta.url),'utf8');
const galleryPage=readFileSync(new URL('../src/components/ServiceGallery.jsx',import.meta.url),'utf8');
const standaloneTheme=readFileSync(new URL('../public/styles/brand-unified.css',import.meta.url),'utf8');
assert(appSource.includes("import './styles/public-theme.css'") &&
  appSource.includes("isPrivateRoute ? undefined : 'sk-public-site'"),
  'Scope uniform theme to all public routes without recolouring admin workflows');
assert(sharedTheme.includes('--sk-ui-ink:#202020') &&
  sharedTheme.includes('--sk-ui-gold:#b16a0e') &&
  sharedTheme.includes(':first-child:not(.is-active)'),
  'White-charcoal-gold tokens and accurate Home dock active state are required');
assert(innerHeader.includes('sk-public-header') &&
  innerHeader.includes('/images/sk-digital-final.svg') &&
  innerHeader.includes('sk-pin-top-action') &&
  innerHeader.includes('/?search=1'),
  'Inner pages require the same real SK logo and functional header search actions');
assert(pinNavSource.includes("variant='pinterest'") &&
  pinNavSource.includes('to="/"') &&
  pinNavSource.includes("navigate('/?search=1')") &&
  pinNavSource.includes('to="/favorites"') &&
  pinNavSource.includes('is-active'),
  'Home, Search and Saved dock must be functional and highlight the correct route');
assert(savedPage.includes('sk-saved-page') &&
  savedPage.includes('sk-pin-masonry') &&
  savedPage.includes('PinterestPinCard') &&
  savedPage.includes('role="tablist"') &&
  savedPage.includes('<MobileHeader'),
  'Saved and Liked must use the Pinterest visual design, not the old green grid');
assert(favoritesContext.includes('toggleLiked') &&
  pinCardSource.includes('toggleLiked(product)') &&
  detailSource.includes('toggleLiked(product)'),
  'Like / Unlike must actually update the Liked collection');
assert(catalogPage.includes('<MobileHeader title="Find your design"') &&
  catalogPage.includes('<MobileBottomNav variant="pinterest"') &&
  categoryListPage.includes('<MobileHeader title="Browse all categories"') &&
  categoryListPage.includes('<MobileBottomNav variant="pinterest"') &&
  !categoryListPage.includes('e.stopPropagation()'),
  'Products and categories must use uniform public header/dock and valid buttons');
assert(contactPage.includes('<MobileHeader title="Contact our Gondia studio"') &&
  contactPage.includes('<MobileBottomNav variant="pinterest"') &&
  galleryPage.includes('sk-public-service-gallery'),
  'Contact and service sections must follow the same storefront theme');
assert(standaloneTheme.includes('.sk-static-bottom-nav') &&
  standaloneTheme.includes('--gold:#b16a0e'),
  'Standalone SEO landing pages need the same dock and logo colours');
for (const slug of [
 'wedding-card-printing-gondia','digital-wedding-invitations',
 'corporate-gifting-gondia','3d-led-sign-boards-gondia',
 'custom-trophies-awards-gondia','flex-banner-printing-gondia'
]) {
  const page=readFileSync(new URL('../public/'+slug+'/index.html',import.meta.url),'utf8');
  assert(page.includes('/styles/brand-unified.css') &&
    page.includes('/images/sk-digital-final.svg') &&
    page.includes('sk-static-bottom-nav'),
    'SEO service page '+slug+' must inherit the public theme');
}
for (const guide of categoryGuideData) {
  if (guide.existingUrl) continue;
  const page=readFileSync(new URL('../public/categories/'+guide.slug+'/index.html',import.meta.url),'utf8');
  assert(page.includes('/styles/brand-unified.css') &&
    page.includes('sk-static-bottom-nav'),
    'Category guide '+guide.slug+' must use the shared public theme');
}

const inspirationPage=readFileSync(new URL('../src/components/Insta.jsx',import.meta.url),'utf8');
const notFoundPage=readFileSync(new URL('../src/pages/NotFound.jsx',import.meta.url),'utf8');
const storyPage=readFileSync(new URL('../src/components/StoryGallery.jsx',import.meta.url),'utf8');
assert(inspirationPage.includes('sk-pinterest-home') &&
  inspirationPage.includes('<MobileHeader') &&
  inspirationPage.includes('<MobileBottomNav variant="pinterest"') &&
  !inspirationPage.includes('from-pink-100'),
  'Legacy image gallery must match the main Pinterest-themed storefront');
assert(notFoundPage.includes('<MobileHeader') &&
  notFoundPage.includes('<MobileBottomNav variant="pinterest"') &&
  !notFoundPage.includes('bg-red-600'),
  '404 page must use the matching brand colours and navigation');
assert(storyPage.includes('/images/sk-digital-final.svg') &&
  storyPage.includes('Return to design gallery'),
  'Immersive story route needs the genuine branded back action');
assert(appSource.includes('LegacyCategoryRedirect') &&
  appSource.includes("<Navigate to={'/products?category='") &&
  appSource.includes('<Route path="/home1"') &&
  appSource.includes('<Navigate to="/" replace />'),
  'Legacy category and homepage routes should open the current shopping experience');
for (const guide of categoryGuideData) {
  if (guide.existingUrl) continue;
  const page=readFileSync(new URL('../public/categories/'+guide.slug+'/index.html',import.meta.url),'utf8');
  assert(page.includes('/images/sk-digital-final.svg'),
    'Category guide '+guide.slug+' should use the finalized SK logo');
}
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
