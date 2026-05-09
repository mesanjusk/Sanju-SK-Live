import fs from 'node:fs';
import path from 'node:path';

const siteUrl = process.env.VITE_SITE_URL || 'https://idfrontend.vercel.app';
const routes = ['/', '/products', '/allListing', '/contact', '/favorites', '/cart', '/checkout'];
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const now = new Date().toISOString();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url><loc>${siteUrl}${route}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`
  )
  .join('\n')}
</urlset>`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log('SEO assets generated');
