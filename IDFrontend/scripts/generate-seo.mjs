import fs from 'node:fs';
import path from 'node:path';

// Single source of truth for business identity, visible FAQ copy and JSON-LD.
const seo = JSON.parse(fs.readFileSync(new URL('../src/config/local-seo.json', import.meta.url), 'utf8'));
const root = path.resolve(new URL('..', import.meta.url).pathname);
const publicDir = path.join(root, 'public');
const home = seo.siteUrl + '/';
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
  '</div><div class="sk-boot-art" aria-hidden="true">',
  '<img src="/images/services/wedding-cards.svg" alt="" width="240" height="280" />',
  '</div></section>',
  '<div class="sk-boot-container"><a class="sk-boot-quote" href="' + quoteUrl + '">',
  '<span><strong>Have something special in mind?</strong><small>Let’s create it together · Get a quote</small></span>',
  '<span class="sk-boot-quote-arrow" aria-hidden="true">→</span></a></div>',
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
  '/products', '/allListing', '/home1', '/contact',
].map(route => ({ route, changefreq: 'monthly', priority: '0.5' }));
const xmlPage = ({ route, changefreq, priority }, isPrimary) =>
  '  <url><loc>' + seo.siteUrl + route + '</loc>' +
  (isPrimary ? '<lastmod>' + primaryPageUpdatedAt + '</lastmod>' : '') +
  '<changefreq>' + changefreq + '</changefreq><priority>' + priority + '</priority></url>';
const xmlPages = [
  ...primaryRoutes.map(entry => xmlPage(entry, true)),
  ...otherRoutes.map(entry => xmlPage(entry, false)),
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
Sitemap: ${seo.siteUrl}/api/sitemap-products
`;
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), sitemapXml);
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log('Generated SEO initial HTML, business graph and static sitemap for', home);
