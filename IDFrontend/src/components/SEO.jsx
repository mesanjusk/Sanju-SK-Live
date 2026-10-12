import { useEffect } from 'react';
import { SITE_META, SITE_URL } from '../config/site';

function upsertMeta(selector, attrs) {
  let tag = document.head.querySelector(selector);
  if (!tag) { tag = document.createElement('meta'); document.head.appendChild(tag); }
  Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
}
function upsertCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = url;
}

export default function SEO({ title, description, pathname = '/', noIndex = false }) {
  // The homepage's full local-business and FAQ schema is generated in index.html
  // at build time. Do not inject duplicate or inconsistent LocalBusiness nodes.
  const isHome = pathname === '/';
  const pageTitle = isHome ? SITE_META.defaultTitle : (title ? `${title} | ${SITE_META.name}` : SITE_META.defaultTitle);
  const pageDescription = isHome ? SITE_META.defaultDescription : (description || SITE_META.defaultDescription);
  const canonicalUrl = SITE_URL + (pathname === '/' ? '/' : pathname);

  useEffect(() => {
    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription });
    for (const [key, value] of Object.entries({
      'og:type': 'website', 'og:title': pageTitle, 'og:description': pageDescription,
      'og:url': canonicalUrl, 'og:image': SITE_META.ogImage,
    })) upsertMeta(`meta[property="${key}"]`, { property: key, content: value });
    for (const [key, value] of Object.entries({
      'twitter:card': 'summary_large_image', 'twitter:title': pageTitle,
      'twitter:description': pageDescription, 'twitter:image': SITE_META.ogImage,
    })) upsertMeta(`meta[name="${key}"]`, { name: key, content: value });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    });
    upsertCanonical(canonicalUrl);
    // FAQ schema only describes visible FAQ on the homepage.
    const faq = document.getElementById('structured-data-jsonld');
    if (faq && !isHome) faq.remove();
  }, [canonicalUrl, isHome, noIndex, pageDescription, pageTitle]);

  return null;
}
