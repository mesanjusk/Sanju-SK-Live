// In-memory, short-lived SPA catalog cache. Product data is public; no customer PII is stored.
// Navigating between a pin and Home no longer waits for Render to fetch the same catalog.
const MAX_AGE_MS=3*60*1000;
const cache=new Map();
export function readCatalogRows(key){
  return cache.has(key)?cache.get(key).rows:null;
}
export function isCatalogCacheFresh(key, now=Date.now()){
  const item=cache.get(key);
  return Boolean(item && now-item.updatedAt>=0 && now-item.updatedAt<MAX_AGE_MS);
}
export function rememberCatalogRows(key,rows,now=Date.now()){
  if(!Array.isArray(rows))return false;
  cache.set(key,{rows,updatedAt:now});
  return true;
}
export function clearCatalogCache(){
  cache.clear();
}
