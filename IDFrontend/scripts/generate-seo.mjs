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
const rootMarkup = [
  '<main id="sk-seo-initial" aria-label="SANJU SK Digital services">',
  '<header><h1>' + esc(seo.businessName) + ' — Printing, 3D Signage and Wedding Cards in Gondia</h1>',
  '<p>' + esc(seo.description) + '</p>',
  '<nav aria-label="Our services"><a href="/wedding-card-printing-gondia/">Wedding invitation printing</a> · ',
  '<a href="/digital-wedding-invitations/">Digital invitations</a> · ',
  '<a href="/corporate-gifting-gondia/">Corporate gifting</a> · <a href="/products">Product collection</a></nav></header>',
  '<section aria-label="Printing and design services"><h2>What we do</h2><ul>',
  ...seo.services.map(s => '<li><strong>' + esc(s.name) + '</strong> — ' + esc(s.description) + '</li>'),
  '</ul></section><section aria-label="Our core product and printing categories"><h2>Explore our core services</h2><ul>',
  ...coreServiceLinks.map(([url, label]) => '<li><a href="' + url + '">' + esc(label) + ' in Gondia</a></li>'),
  '</ul></section><section aria-label="Frequently asked questions"><h2>Common questions</h2>',
  ...seo.faqs.map(f => '<h3>' + esc(f.question) + '</h3><p>' + esc(f.answer) + '</p>'),
  '</section><footer><strong>' + esc(seo.businessName) + '</strong><address>',
  esc(seo.address.streetAddress) + ', ' + esc(seo.address.addressLocality) + ', ' +
  esc(seo.address.addressRegion) + ' ' + esc(seo.address.postalCode) + ', India',
  '</address><a href="tel:' + seo.phone + '">' + esc(seo.displayPhone) + '</a> · ',
  'Monday–Saturday 10 AM–8 PM · Sunday closed</footer></main>',
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
