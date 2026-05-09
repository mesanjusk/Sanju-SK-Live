import { useEffect } from 'react';
import { SITE_META, SITE_URL } from '../config/site';

const upsertMeta = (selector, attrs) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }
  Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
};

const upsertLink = (rel, href) => {
  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const JsonLd = ({ data }) => {
  useEffect(() => {
    const scriptId = 'local-business-jsonld';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
    return () => {
      script?.remove();
    };
  }, [data]);

  return null;
};

const SEO = ({ title, description, pathname = '/', noIndex = false }) => {
  const pageTitle = title ? `${title} | ${SITE_META.name}` : SITE_META.defaultTitle;
  const pageDescription = description || SITE_META.defaultDescription;
  const canonicalUrl = `${SITE_URL}${pathname}`;

  useEffect(() => {
    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: pageDescription,
    });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: SITE_META.ogImage });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: pageDescription,
    });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: SITE_META.ogImage });
    upsertMeta('meta[name="twitter:site"]', { name: 'twitter:site', content: SITE_META.twitterHandle });

    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow',
    });

    upsertLink('canonical', canonicalUrl);
  }, [canonicalUrl, noIndex, pageDescription, pageTitle]);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_META.business.name,
    url: SITE_URL,
    telephone: SITE_META.business.phone,
    email: SITE_META.business.email,
    address: {
      '@type': 'PostalAddress',
      ...SITE_META.business.address,
    },
  };

  return <JsonLd data={localBusinessSchema} />;
};

export default SEO;
