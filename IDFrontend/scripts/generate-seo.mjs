import fs from 'node:fs';
import path from 'node:path';

// Single source of truth for business identity, visible FAQ copy and JSON-LD.
const seo = JSON.parse(fs.readFileSync(new URL('../src/config/local-seo.json', import.meta.url), 'utf8'));
const root = path.resolve(new URL('..', import.meta.url).pathname);
const publicDir = path.join(root, 'public');
const home = seo.siteUrl + '/';
const img = (p) => seo.siteUrl + p;
const areaServed = [
  ['Gondia', 'Maharashtra'],
  ['Nagpur', 'Maharashtra'],
  ['Balaghat', 'Madhya Pradesh'],
].map(([city, state]) => ({
  '@type': 'City', name: city,
  containedInPlace: { '@type': 'AdministrativeArea', name: state },
}));
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
      priceRange: '₹₹',
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
  '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
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

const routes = [
  '/', '/wedding-card-printing-gondia/', '/digital-wedding-invitations/',
  '/corporate-gifting-gondia/', '/products', '/allListing', '/home1', '/contact',
];
fs.mkdirSync(publicDir, { recursive: true });
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes.map(route => '  <url><loc>' + seo.siteUrl + route + '</loc></url>').join('\n') +
  '\n</urlset>\n';
const robots = `User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /upload
Disallow: /UploadCategory
Disallow: /UploadSubcategory
Disallow: /UploadBanner
Disallow: /add
Sitemap: ${seo.siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log('Generated homepage SEO schema and crawl assets for', home);
