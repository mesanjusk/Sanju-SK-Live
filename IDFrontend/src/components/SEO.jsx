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

export default function SEO({ title, description, pathname = '/', noIndex = false, image }) {
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
      'og:url': canonicalUrl, 'og:image': image || SITE_META.ogImage,
    })) upsertMeta(`meta[property="${key}"]`, { property: key, content: value });
    for (const [key, value] of Object.entries({
      'twitter:card': 'summary_large_image', 'twitter:title': pageTitle,
      'twitter:description': pageDescription, 'twitter:image': image || SITE_META.ogImage,
    })) upsertMeta(`meta[name="${key}"]`, { name: key, content: value });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    });
    upsertCanonical(canonicalUrl);
    // Keep full FAQ schema on the homepage, and remove only the FAQ/WebPage
    // graph nodes on SPA routes that do not display the homepage FAQ.
    const script = document.getElementById('structured-data-jsonld');
    if (script) {
      if (!script.dataset.homeSchema) script.dataset.homeSchema = script.textContent;
      try {
        const graph = JSON.parse(script.dataset.homeSchema);
        if (!isHome) graph['@graph'] = graph['@graph'].filter(
          node => node['@type'] !== 'FAQPage' && node['@type'] !== 'WebPage'
        );
        script.textContent = JSON.stringify(graph);
      } catch (error) {
        console.warn('Could not update route-specific structured data', error);
      }
    }
  }, [canonicalUrl, isHome, noIndex, pageDescription, pageTitle, image]);

  return null;
}
