// SANJU SK Digital category merchandising. No fictional offers or prices.
const THEMES = {
  all: { key:'all', label:'All designs', background:'#eee5fa', accent:'#7954a6', ink:'#483061', soft:'#f8f2ff', strapline:'Original designs, personalised for your occasion', promo:'Custom-made for moments that matter' },
  wedding: { key:'wedding', label:'Wedding cards', background:'#fae4f0', accent:'#a43d7c', ink:'#612a52', soft:'#fff2fa', strapline:'Laser-cut, traditional and premium invitations', promo:'Your celebration deserves a beautiful invitation' },
  signage: { key:'signage', label:'3D signage', background:'#162d55', accent:'#4d6eb0', ink:'#f8f3ff', soft:'#e7edfb', strapline:'Acrylic, illuminated letters and shopfront signage', promo:'Make your brand stand out, day and night' },
  trophies: { key:'trophies', label:'Awards & trophies', background:'#e9dff5', accent:'#7653a2', ink:'#483267', soft:'#f8f1fe', strapline:'Custom awards, mementos and recognition gifts', promo:'Celebrate achievements beautifully' },
  gifting: { key:'gifting', label:'Corporate gifting', background:'#efe0f2', accent:'#874d89', ink:'#603b61', soft:'#f9f0fb', strapline:'Branded gifts and thoughtful packaging', promo:'Make every gift feel personal' },
  flex: { key:'flex', label:'Large-format printing', background:'#ffe9e4', accent:'#ae4c5e', ink:'#633340', soft:'#fff5f2', strapline:'Flex, standees, banners and vinyl graphics', promo:'Bold printing for your biggest ideas' },
};
export const getCategoryTheme = (name = '') => {
  const label=String(name||'');
  if (!label) return THEMES.all;
  if (/wedding|marriage|invitation|shaadi|lagna/i.test(label)) return THEMES.wedding;
  if (/led|sign|neon|acrylic|glow|letter|name.?plate/i.test(label)) return THEMES.signage;
  if (/troph|award|memento|medal|trophy/i.test(label)) return THEMES.trophies;
  if (/gift|hamper|mug|corporate|diwali/i.test(label)) return THEMES.gifting;
  if (/flex|banner|vinyl|standee|print|poster|hoarding/i.test(label)) return THEMES.flex;
  return THEMES.all;
};
