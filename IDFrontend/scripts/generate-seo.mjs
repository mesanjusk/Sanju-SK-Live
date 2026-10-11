import fs from 'node:fs';
import path from 'node:path';

// Always publish canonical URLs for the verified public business domain,
// including when a preview deployment is built on Vercel.
const siteUrl = 'https://www.sanjusk.in';
const routes = [
  '/',
  '/wedding-card-printing-gondia/',
  '/digital-wedding-invitations/',
  '/corporate-gifting-gondia/',
  '/products',
  '/allListing',
  '/home1',
  '/contact',
];
const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route, i) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <changefreq>${i === 0 ? 'weekly' : 'monthly'}</changefreq>
    <priority>${i === 0 ? '1.0' : route.startsWith('/products') ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;
const robots = `User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
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
Sitemap: ${siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
console.log('Canonical SEO assets generated for', siteUrl);
