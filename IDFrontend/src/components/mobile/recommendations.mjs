// Private, lightweight design interests. No names, phones, IPs, or user identity.
const STORAGE_KEY = 'sk_design_interests_v1';
const COMMON = new Set('the and for with from this that all custom design designs digital sanju gondia printing print card cards a an to in by of on as or your our new premium available product'.split(' '));

export const itemId = item => String(item?._id || item?.id || item || '').trim();
export function secureRandomSeed() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0] || 1;
  }
  return Math.floor(Math.random() * 0xffffffff) || 1;
}
export function shuffleWithSeed(items = [], seed = 1) {
  const output = [...items];
  let state = seed >>> 0;
  const rand = () => {
    state += 0x6D2B79F5;
    let z = state;
    z = Math.imul(z ^ z >>> 15, z | 1);
    z ^= z + Math.imul(z ^ z >>> 7, z | 61);
    return ((z ^ z >>> 14) >>> 0) / 4294967296;
  };
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}
const categoryOf = product => String(product?.category?.name || product?.category?._id ||
  product?.category?.category_uuid || product?.category || product?.categoryName || '').toLowerCase().trim();
const tokens = value => new Set(String(value || '').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(w => !COMMON.has(w)) || []);
export function interestFromProduct(product, action = 'view') {
  return {
    id: itemId(product),
    title: String(product?.title || '').slice(0, 130),
    category: categoryOf(product),
    keywords: String(product?.description || '').slice(0, 160),
    action: action === 'save' ? 'save' : 'view',
  };
}
export function readDesignInterests() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const values = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(values) ? values.filter(i => i?.id).slice(0, 12) : [];
  } catch { return []; }
}
export function recordDesignInterest(product, action = 'view') {
  const entry = interestFromProduct(product, action);
  if (!entry.id) return;
  try {
    if (typeof localStorage === 'undefined') return;
    // The most recently opened or saved style receives the strongest weight.
    const previous = readDesignInterests().filter(i => i.id !== entry.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...previous].slice(0, 12)));
  } catch { /* browsing still works when storage is disabled */ }
}
function affinity(product, interests) {
  const candidate = tokens([product?.title, product?.description].filter(Boolean).join(' '));
  const category = categoryOf(product);
  return interests.reduce((sum, interest, index) => {
    const key = itemId(product);
    if (interest.id === key) return sum - 3;
    const weight = (interest.action === 'save' ? 1.5 : 1) * Math.max(.3, 1 - index * .13);
    let score = category && interest.category && category === interest.category ? 11 : 0;
    const preferred = tokens(interest.title + ' ' + interest.keywords);
    for (const token of preferred) if (candidate.has(token)) score += 2.6;
    return sum + Math.min(26, score) * weight;
  }, 0);
}
export function orderDesigns(products, interests = [], seed = 1, geminiIds = []) {
  const shuffled = shuffleWithSeed(products, seed);
  if (!interests.length && !geminiIds.length) return shuffled;
  const priority = new Map(geminiIds.map((id, index) => [String(id), (geminiIds.length - index) * 5]));
  const ranked = shuffled.map((p, index) => ({ p, index,
    score: affinity(p, interests) + (priority.get(itemId(p)) || 0) }));
  const similar = ranked.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  const other = ranked.filter(r => r.score <= 0);
  // Balance relevance with serendipity: 4 related followed by 2 other designs.
  const output = [];
  while (similar.length || other.length) {
    for (let i = 0; i < 4 && similar.length; i++) output.push(similar.shift().p);
    for (let i = 0; i < 2 && other.length; i++) output.push(other.shift().p);
    if (!similar.length) while (other.length) output.push(other.shift().p);
  }
  return output;
}
export async function geminiDesignIds(products, interests, signal) {
  if (!interests.length || !products.length || typeof fetch === 'undefined') return [];
  try {
    const response = await fetch('/api/recommend-designs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
      body: JSON.stringify({
        interests: interests.slice(0, 4),
        candidates: products.slice(0, 100).map(p => ({
          id: itemId(p), title: String(p?.title || '').slice(0, 100),
          category: categoryOf(p), description: String(p?.description || '').slice(0, 130),
        })),
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.ids) ? data.ids.filter(id => typeof id === 'string').slice(0, 35) : [];
  } catch { return []; }
}
