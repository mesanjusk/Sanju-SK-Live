// Public catalog only. A short-lived tab-scoped session cache protects
// Home > Pin > Buy Now > Back against network cold starts and image reloads.
const MAX_AGE_MS=5*60*1000;
const PREFIX='sk_catalog_session_v2_';
const cache=new Map();
function valid(item,now){
  return Boolean(item&&Array.isArray(item.rows)&&
    Number.isFinite(item.updatedAt)&&now-item.updatedAt>=0&&now-item.updatedAt<MAX_AGE_MS);
}
function fromSession(key){
  if(typeof sessionStorage==='undefined')return null;
  try{
    const item=JSON.parse(sessionStorage.getItem(PREFIX+key)||'null');
    if(!valid(item,Date.now())){
      sessionStorage.removeItem(PREFIX+key);return null;
    }
    cache.set(key,item);return item;
  }catch{return null;}
}
export function readCatalogRows(key){
  const item=cache.get(key)||fromSession(key);
  return valid(item,Date.now())?item.rows:null;
}
export function isCatalogCacheFresh(key,now=Date.now()){
  return valid(cache.get(key)||fromSession(key),now);
}
export function rememberCatalogRows(key,rows,now=Date.now()){
  if(!Array.isArray(rows))return false;
  const item={rows,updatedAt:now};
  cache.set(key,item);
  // Avoid sessionStorage quota failure for unusually large catalogs.
  if(typeof sessionStorage!=='undefined'){
    try{sessionStorage.setItem(PREFIX+key,JSON.stringify(item));}catch{}
  }
  return true;
}
export function clearCatalogCache(){
  cache.clear();
  if(typeof sessionStorage!=='undefined'){
    try{for(const key of ['listings','categories','subcategories','videos'])
      sessionStorage.removeItem(PREFIX+key);}catch{}
  }
}
