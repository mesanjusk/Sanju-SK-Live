import localSeo from './local-seo.json';
export const SITE_URL = localSeo.siteUrl;
export const SITE_META = {
  name: localSeo.businessName,
  defaultTitle: localSeo.headline,
  defaultDescription: localSeo.description,
  twitterHandle: '',
  ogImage: `${SITE_URL}${localSeo.ogImagePath}`,
  whatsappNumber: localSeo.phone.replace(/\D/g, ''),
  business: {
    name: localSeo.businessName,
    phone: localSeo.phone,
    email: 'skgondia@gmail.com',
    address: localSeo.address,
  },
};
