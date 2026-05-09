export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://idfrontend.vercel.app';

export const SITE_META = {
  name: 'Sanju SK',
  defaultTitle: 'Sanju SK | Premium Invitations & Gifts',
  defaultDescription:
    'Discover handcrafted invitations, customized gifts, and festive products from Sanju SK.',
  twitterHandle: '@sanjusk',
  ogImage: `${SITE_URL}/og-default.webp`,
  whatsappNumber: '919999999999',
  business: {
    name: 'Sanju SK',
    phone: '+91-99999-99999',
    email: 'hello@sanjusk.com',
    address: {
      streetAddress: 'Main Market Road',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302001',
      addressCountry: 'IN',
    },
  },
};
