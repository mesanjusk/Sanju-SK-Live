import fs from 'node:fs';
import path from 'node:path';

// Single source of truth for business identity, visible FAQ copy and JSON-LD.
const seo = JSON.parse(fs.readFileSync(new URL('../src/config/local-seo.json', import.meta.url), 'utf8'));
const root = path.resolve(new URL('..', import.meta.url).pathname);
const publicDir = path.join(root, 'public');
const home = seo.siteUrl + '/';
const categoryGuides = JSON.parse(fs.readFileSync(new URL('../src/config/category-seo.json', import.meta.url), 'utf8'));
const categoryGuideUrl = guide => guide.existingUrl || '/categories/' + guide.slug + '/';
const newCategoryGuides = categoryGuides.filter(guide => !guide.existingUrl);

const coreServiceLinks = [
  ['/wedding-card-printing-gondia/', 'Designer Wedding Cards & Laser-Cut Invitations'],
  ['/3d-led-sign-boards-gondia/', '3D LED Channel Letters & Acrylic Sign Boards'],
  ['/custom-trophies-awards-gondia/', 'Customized Trophies, Mementos & Corporate Awards'],
  ['/flex-banner-printing-gondia/', 'Large Format Flex Banners, Standees & Vinyl Graphics'],
];
const img = (p) => seo.siteUrl + p;
const areaServed = [
  ['Gondia', 'Maharashtra'],
  ['Nagpur', 'Maharashtra'],
  ['Balaghat', 'Madhya Pradesh'],
  ['Bhandara', 'Maharashtra'],
].map(([city, state]) => ({
  '@type': 'City', name: city,
  containedInPlace: { '@type': 'AdministrativeArea', name: state },
}));
areaServed.push({ '@type': 'AdministrativeArea', name: 'Maharashtra' });
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      // PrintShop is not an established Schema.org type; Store + LocalBusiness are valid.
      '@type': ['LocalBusiness', 'Store'],
      '@id': home + '#business',
      name: seo.businessName,
      legalName: seo.businessName,
      alternateName: seo.alternateName,
      description: seo.description,
      url: home,
      logo: img(seo.logoPath),
      image: img(seo.ogImagePath),
      telephone: seo.phone,
      priceRange: seo.priceRange || '₹₹',
      currenciesAccepted: 'INR',
      address: { '@type': 'PostalAddress', ...seo.address },
      geo: { '@type': 'GeoCoordinates', ...seo.geo },
      hasMap: seo.mapUrl,
      sameAs: [seo.instagramUrl, seo.mapUrl],
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: seo.openingHours.days.map(day => 'https://schema.org/' + day),
        opens: seo.openingHours.opens, closes: seo.openingHours.closes,
      }],
      areaServed,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Printing, Signage, Wedding Cards and Corporate Branding',
        itemListElement: seo.services.map(service => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service', name: service.name,
            description: service.description,
            provider: { '@id': home + '#business' },
          },
        })),
      },
    },
    {
      '@type': 'WebSite', '@id': home + '#website',
      url: home, name: seo.businessName,
      publisher: { '@id': home + '#business' },
    },
    {
      '@type': 'WebPage', '@id': home + '#webpage',
      url: home, name: seo.headline, description: seo.description,
      about: { '@id': home + '#business' },
      isPartOf: { '@id': home + '#website' },
    },
    {
      '@type': 'FAQPage', '@id': home + '#faq',
      mainEntity: seo.faqs.map(f => ({
        '@type': 'Question', name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ],
};
const esc = str => String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');
const tags = [
  '<title>' + esc(seo.headline) + '</title>',
  '<meta name="description" content="' + esc(seo.description) + '" />',
  '<meta name="author" content="' + esc(seo.businessName) + '" />',
  '<meta name="robots" content="index, follow" />',
  '<link rel="canonical" href="' + home + '" />',
  '<meta property="og:locale" content="en_IN" />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:site_name" content="' + esc(seo.businessName) + '" />',
  '<meta property="og:title" content="' + esc(seo.headline) + '" />',
  '<meta property="og:description" content="' + esc(seo.description) + '" />',
  '<meta property="og:url" content="' + home + '" />',
  '<meta property="og:image" content="' + img(seo.ogImagePath) + '" />',
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  '<meta property="og:image:alt" content="' + esc(seo.businessName + ' printing and signage studio in Gondia') + '" />',
  '<meta name="twitter:card" content="summary_large_image" />',
  '<meta name="twitter:title" content="' + esc(seo.headline) + '" />',
  '<meta name="twitter:description" content="' + esc(seo.description) + '" />',
  '<meta name="twitter:image" content="' + img(seo.ogImagePath) + '" />',
  '<meta name="geo.region" content="IN-MH" />',
  '<meta name="geo.placename" content="Gondia" />',
  '<meta name="geo.position" content="' + seo.geo.latitude + ';' + seo.geo.longitude + '" />',
  '<script type="application/ld+json" id="structured-data-jsonld">' + jsonLd + '</script>',
].map(s => '    ' + s).join('\n');
const indexFile = path.join(root, 'index.html');
const source = fs.readFileSync(indexFile, 'utf8');
const start = '<!-- SEO GENERATED HEAD START -->';
const end = '<!-- SEO GENERATED HEAD END -->';
if (!source.includes(start) || !source.includes(end)) throw new Error('SEO head markers missing from index.html');
fs.writeFileSync(indexFile, source.replace(new RegExp(start + '[\\s\\S]*?' + end),
  start + '\n' + tags + '\n    ' + end));

// Initial HTML includes factual, crawlable business content while React boots.
// The React storefront replaces this fallback without any change to the UI.
const bodyStart = '<!-- SEO STATIC BODY START -->';
const bodyEnd = '<!-- SEO STATIC BODY END -->';
const staticCategoryImages = [
  '/images/services/wedding-cards.svg',
  '/images/services/led-signage.svg',
  '/images/services/trophies.svg',
  '/images/services/flex-banners.svg',
];
const quoteNumber = String(seo.phone).replace(/\D/g, '');
const quoteUrl = 'https://wa.me/' + quoteNumber + '?text=' +
  encodeURIComponent('Hi Sanju SK Digital, I would like a quotation for custom printing.');
const staticCards = coreServiceLinks.map(([url, label], index) =>
  '<a class="sk-boot-card" href="' + url + '">' +
  '<img src="' + staticCategoryImages[index] + '" alt="' + esc(label) +
  ' by SANJU SK Digital in Gondia" width="320" height="300" />' +
  '<span>' + esc(label) + '</span></a>'
).join('');
const rootMarkup = [
  '<main id="sk-seo-initial" aria-label="SANJU SK Digital services">',
  '<div class="sk-boot-shell">',
  '<header class="sk-boot-header sk-boot-container">',
  '<a href="/" class="sk-boot-brand" aria-label="SANJU SK Digital homepage">',
  '<span class="sk-boot-mark">SK</span><span>SANJU SK</span></a>',
  '<div class="sk-boot-search" aria-label="Product search is loading">⌕ &nbsp;Search products</div>',
  '<a href="/contact" class="sk-boot-menu" aria-label="Contact SANJU SK Digital">⋮</a>',
  '</header>',
  '<div class="sk-boot-location sk-boot-container">',
  '<span>Made with ♥ in <strong>Gondia, Maharashtra</strong></span>',
  '<a href="tel:' + seo.phone + '">' + esc(seo.displayPhone) + '</a></div>',
  '<nav class="sk-boot-category-tabs sk-boot-container" aria-label="Browse our services">',
  '<a href="/" aria-current="page">▦ <span>All</span></a>',
  ...coreServiceLinks.map(([url, label]) => '<a href="' + url + '">✦ <span>' + esc(label) + '</span></a>'),
  '</nav>',
  '<section class="sk-boot-hero sk-boot-container" aria-label="Printing and design in Gondia">',
  '<div class="sk-boot-copy">',
  '<p class="sk-boot-kicker">✦ GONDIA DESIGN STUDIO · SINCE 2006</p>',
  '<h1>Wedding cards, signage &amp; <em>flex printing in Gondia.</em></h1>',
  '<p class="sk-boot-description">Laser-cut wedding invitations, 3D LED acrylic signs, corporate awards and banners — designed for Gondia and delivered across nearby cities.</p>',
  '<a class="sk-boot-hero-cta" href="' + quoteUrl + '">Get a custom quote →</a>',
  '</div><div class="sk-boot-art" aria-hidden="true">',
  '<img src="/images/services/wedding-cards.svg" alt="" width="240" height="280" />',
  '</div></section>',
  '<section class="sk-boot-picks sk-boot-container" aria-labelledby="sk-boot-collections-title">',
  '<div class="sk-boot-heading"><h2 id="sk-boot-collections-title">Discover our collections</h2>',
  '<span>Swipe to explore →</span></div>',
  '<div class="sk-boot-collections">' + staticCards + '</div></section>',
  '</div>',
  '<div class="sk-boot-benefits">✉ Custom designs &nbsp; ◈ Made to order &nbsp; ♡ Corporate gifting</div>',
  '<details class="sk-boot-more"><summary>Services, FAQs &amp; store information</summary>',
  '<section aria-label="Printing and design services"><h2>Our signature services</h2><ul>',
  ...seo.services.map(s => '<li><strong>' + esc(s.name) + '</strong> — ' + esc(s.description) + '</li>'),
  '</ul></section><section aria-label="Our core product and printing categories"><h2>Explore our core services</h2><ul>',
  ...coreServiceLinks.map(([url, label]) => '<li><a href="' + url + '">' + esc(label) + ' in Gondia</a></li>'),
  '</ul></section><section aria-label="Browse our product categories in Gondia">',
  '<h2>Printing categories and custom work in Gondia</h2><p>Explore category guides for design options, artwork requirements and how to request an accurate quotation.</p><ul>',
  ...categoryGuides.map(guide => '<li><a href="' + categoryGuideUrl(guide) + '">' + esc(guide.name) +
    ' printing and customisation</a> — ' + esc(guide.intro) + '</li>'),
  '</ul></section><section aria-label="Frequently asked questions"><h2>Common questions</h2>',
  ...seo.faqs.map(f => '<h3>' + esc(f.question) + '</h3><p>' + esc(f.answer) + '</p>'),
  '</section><footer><strong>' + esc(seo.businessName) + '</strong><address>',
  esc(seo.address.streetAddress) + ', ' + esc(seo.address.addressLocality) + ', ' +
  esc(seo.address.addressRegion) + ' ' + esc(seo.address.postalCode) + ', India',
  '</address><a href="tel:' + seo.phone + '">' + esc(seo.displayPhone) + '</a> · ',
  'Monday–Saturday 10 AM–8 PM · Sunday closed</footer></details></main>',
].join('');
const currentIndex = fs.readFileSync(indexFile, 'utf8');
if (!currentIndex.includes(bodyStart) || !currentIndex.includes(bodyEnd)) {
  throw new Error('SSR fallback body markers missing from index.html');
}
fs.writeFileSync(indexFile, currentIndex.replace(
  new RegExp(bodyStart + '[\\s\\S]*?' + bodyEnd),
  () => bodyStart + '\n' + rootMarkup + '\n' + bodyEnd
));


// Unique, crawlable category guides for categories confirmed from the real storefront.
// Wedding Cards and Trophies already have dedicated service pages; don't duplicate them.
const categoryLastModified = '2026-11-03';
const categoryLinks = categoryGuides.map(guide => ({
  href: categoryGuideUrl(guide),
  label: guide.name,
}));
const categoryPage = guide => {
  const canonical = seo.siteUrl + '/categories/' + guide.slug + '/';
  const nav = categoryLinks
    .filter(item => item.href !== '/categories/' + guide.slug + '/')
    .map(item => '<a href="' + item.href + '">' + esc(item.label) + '</a>').join('');
  const list = (items) => items.map(item => '<li>' + esc(item) + '</li>').join('');
  const question1 = 'What details should I share for a ' + guide.name.toLowerCase() + ' quotation?';
  const answer1 = 'Share the intended use, design or photo reference, quantity, preferred size and required date. ' +
    'SANJU SK Digital in Gondia will review the details and confirm suitable options and pricing.';
  const question2 = 'Can ' + guide.name.toLowerCase() + ' designs be personalised?';
  const answer2 = 'You can request personalised artwork. Share your names, text, colours or logo so the studio can ' +
    'review the design brief and confirm available materials and finishes before production.';
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': canonical + '#webpage',
        url: canonical,
        name: guide.title,
        description: guide.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': home + '#website' },
        about: { '@id': home + '#business' },
        breadcrumb: { '@id': canonical + '#breadcrumb' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': canonical + '#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: home },
          { '@type': 'ListItem', position: 2, name: guide.name, item: canonical },
        ],
      },
      {
        '@type': 'Service',
        name: guide.name + ' customisation and printing',
        areaServed: areaServed,
        provider: { '@id': home + '#business' },
        description: guide.intro,
        url: canonical,
      },
    ],
  };
  const json = JSON.stringify(graph).replace(/</g, '\\u003c');
  const whatsapp = 'https://wa.me/' + quoteNumber + '?text=' +
    encodeURIComponent('Hi Sanju SK Digital, I would like a quote for ' + guide.name +
      '. Please share the available designs and what details you need.');
  const productSearch = '/products?search=' + encodeURIComponent(guide.name);
  const style = '<style>' +
    '*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;color:#4b3663;background:#faf7ff}' +
    'a{color:#7652a2}header,main,footer{max-width:920px;margin:auto;padding:18px}' +
    'header{display:flex;justify-content:space-between;align-items:center;gap:12px}' +
    '.logo{font-weight:900;white-space:nowrap;text-decoration:none;color:#5c397d}' +
    '.eyebrow{font-weight:800;letter-spacing:.12em;font-size:11px;color:#977db3}' +
    '.hero{background:linear-gradient(130deg,#eee2fb,#fdf9ff);border:1px solid #e7dcef;border-radius:22px;padding:25px 20px}' +
    'h1{font-size:clamp(24px,5vw,38px);line-height:1.15;margin:7px 0 12px}' +
    'h2{font-size:19px;margin:0 0 12px}p,li{font-size:14px;line-height:1.7}' +
    '.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.btn{display:inline-block;border-radius:999px;padding:10px 14px;text-decoration:none;background:#7654a6;color:#fff;font-weight:800;font-size:13px}' +
    '.btn.alt{background:#fff;color:#66478b;border:1px solid #d5c5e7}' +
    '.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:17px 0}' +
    '.box{background:#fff;border:1px solid #e7dcef;border-radius:17px;padding:17px}' +
    '.box ul{padding-left:20px;margin-bottom:0}.faq{border-bottom:1px solid #e6ddef;padding:10px 0}.faq h3{font-size:15px;margin:0}' +
    '.links{display:flex;flex-wrap:wrap;gap:8px}.links a{background:#f0e8f9;padding:7px 10px;border-radius:999px;font-size:12px;text-decoration:none}' +
    'footer{border-top:1px solid #e4d9ec;color:#746582;font-size:13px;line-height:1.7}' +
    '@media(max-width:600px){.grid{grid-template-columns:1fr}main,header,footer{padding:14px}.hero{padding:20px 15px}}' +
    '</style>';
  return '<!doctype html><html lang="en-IN"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<meta name="theme-color" content="#EFE6FB">' +
    '<title>' + esc(guide.title) + '</title>' +
    '<meta name="description" content="' + esc(guide.description) + '">' +
    '<meta name="robots" content="index, follow">' +
    '<link rel="canonical" href="' + canonical + '">' +
    '<meta property="og:type" content="website">' +
    '<meta property="og:title" content="' + esc(guide.title) + '">' +
    '<meta property="og:description" content="' + esc(guide.description) + '">' +
    '<meta property="og:url" content="' + canonical + '">' +
    '<meta property="og:image" content="' + img(seo.ogImagePath) + '">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<script type="application/ld+json">' + json + '</script>' + style + '</head><body>' +
    '<header><a href="/" class="logo">SK · SANJU SK DIGITAL</a><a href="/contact">Contact Gondia Studio</a></header>' +
    '<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / ' + esc(guide.name) + '</nav>' +
    '<section class="hero"><p class="eyebrow">CUSTOM DESIGN & PRINTING · GONDIA</p>' +
    '<h1>' + esc(guide.name) + ' printing and personalised designs in Gondia</h1>' +
    '<p>' + esc(guide.intro) + '</p>' +
    '<div class="actions"><a class="btn" href="' + whatsapp + '">Request a quotation</a>' +
    '<a class="btn alt" href="' + productSearch + '">Browse ' + esc(guide.name) + ' products</a>' +
    '<a class="btn alt" href="tel:' + seo.phone + '">Call ' + esc(seo.displayPhone) + '</a></div></section>' +
    '<div class="grid"><section class="box"><h2>Design and personalisation options</h2><ul>' + list(guide.options) + '</ul></section>' +
    '<section class="box"><h2>Common uses</h2><ul>' + list(guide.usage) + '</ul></section></div>' +
    '<section class="box"><h2>What to send for an accurate quote</h2><ul>' + list(guide.checklist) + '</ul>' +
    '<p>Available sizes, materials, finishes, turnaround and final price depend on the specific requirements. Confirm them with the studio before ordering.</p></section>' +
    '<section class="box" style="margin-top:16px"><h2>Helpful questions</h2>' +
    '<div class="faq"><h3>' + esc(question1) + '</h3><p>' + esc(answer1) + '</p></div>' +
    '<div class="faq"><h3>' + esc(question2) + '</h3><p>' + esc(answer2) + '</p></div></section>' +
    '<section class="box" style="margin-top:16px"><h2>Other SANJU SK Digital categories</h2>' +
    '<nav class="links" aria-label="Other category guides">' + nav + '</nav>' +
    '<p>Explore our <a href="/wedding-card-printing-gondia/">wedding invitation printing</a>, ' +
    '<a href="/3d-led-sign-boards-gondia/">3D LED signage</a>, ' +
    '<a href="/custom-trophies-awards-gondia/">custom awards</a> and ' +
    '<a href="/flex-banner-printing-gondia/">large-format banner printing</a> services.</p></section>' +
    '</main><footer><strong>' + esc(seo.businessName) + '</strong> · ' +
    esc(seo.address.streetAddress) + ', Gondia, Maharashtra 441601 · ' +
    '<a href="tel:' + seo.phone + '">' + esc(seo.displayPhone) + '</a>' +
    '<p>Open Monday–Saturday, 10:00 AM–8:00 PM · Closed Sunday. Serving enquiries from Gondia, Nagpur, Balaghat and Bhandara.</p>' +
    '</footer></body></html>';
};
for (const guide of newCategoryGuides) {
  const dir = path.join(publicDir, 'categories', guide.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), categoryPage(guide));
}

// A real content-modification date, not the Vercel build date.
// Update when changing these primary landing pages; don't bump on every deployment.
const primaryPageUpdatedAt = '2026-11-01';
const primaryRoutes = [
  { route: '/', changefreq: 'weekly', priority: '1.0' },
  { route: '/wedding-card-printing-gondia/', changefreq: 'monthly', priority: '0.8' },
  { route: '/3d-led-sign-boards-gondia/', changefreq: 'monthly', priority: '0.8' },
  { route: '/custom-trophies-awards-gondia/', changefreq: 'monthly', priority: '0.8' },
  { route: '/flex-banner-printing-gondia/', changefreq: 'monthly', priority: '0.8' },
];
const otherRoutes = [
  '/digital-wedding-invitations/', '/corporate-gifting-gondia/',
  '/products', '/contact',
].map(route => ({ route, changefreq: 'monthly', priority: '0.5' }));
const xmlPage = ({ route, changefreq, priority }, isPrimary) =>
  '  <url><loc>' + seo.siteUrl + route + '</loc>' +
  (isPrimary ? '<lastmod>' + primaryPageUpdatedAt + '</lastmod>' : '') +
  '<changefreq>' + changefreq + '</changefreq><priority>' + priority + '</priority></url>';
const xmlPages = [
  ...primaryRoutes.map(entry => xmlPage(entry, true)),
  ...otherRoutes.map(entry => xmlPage(entry, false)),
  ...newCategoryGuides.map(guide =>
    '<url><loc>' + seo.siteUrl + '/categories/' + guide.slug + '/</loc>' +
    '<lastmod>' + categoryLastModified + '</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>'),
];
const sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  xmlPages.join('\n') + '\n</urlset>\n';
// Keep the old sitemap-pages URL working for integrations that already use it.
// The root /sitemap.xml is the canonical static sitemap requested for GSC.
const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /upload
Disallow: /UploadCategory
Disallow: /UploadSubcategory
Disallow: /UploadBanner
Disallow: /add

Sitemap: ${seo.siteUrl}/sitemap.xml
Sitemap: ${seo.siteUrl}/sitemap-products.xml
`;
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), sitemapXml);
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log('Generated SEO initial HTML, business graph and static sitemap for', home);
