const EVENTS=new Set([
  'pageview','category_view','product_view','product_click','search',
  'favorite_save','checkout_start','quote_request','whatsapp_click',
  'payment_client_confirmed'
]);
const DEVICE=new Set(['mobile','tablet','desktop']);
const BROWSER=new Set(['Chrome','Firefox','Safari','Edge','Other']);
const OS=new Set(['Android','iOS','Windows','macOS','Linux','Other']);
const CONNECTION=new Set(['slow-2g','2g','3g','4g','unknown']);
const ID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const escape=s=>String(s||'').replace(/[^a-zA-Z0-9 _.\/-]+/g,' ').trim();
const limited=(s,n=64)=>escape(s).slice(0,n);
const marketing=s=>{
  const raw=String(s||'');
  // Reject e-mail/phone information before punctuation sanitization.
  if(/@|\d{8,}/.test(raw))return '';
  return limited(raw);
};
export function isAnonymousId(id){return ID.test(String(id||''));}
export function cleanAnalyticsEvent(body={}){
  if(!isAnonymousId(body.visitorId)||!isAnonymousId(body.sessionId)||
    !EVENTS.has(body.event))throw new Error('Invalid anonymous analytics event.');
  const path=String(body.path||'/').split('?')[0].split('#')[0];
  if(!/^\/(?!\/)[\w/-]*$/.test(path)||path.length>160)
    throw new Error('Invalid public page path.');
  const productId=/^[a-f\d]{24}$/i.test(String(body.productId||''))
    ?String(body.productId).toLowerCase():'';
  return {
    visitorId:body.visitorId.toLowerCase(),sessionId:body.sessionId.toLowerCase(),
    isNew:body.isNew===true,path,event:body.event,
    landingPath:limited(body.landingPath,130)||'/',
    productId,
    categoryId:limited(body.categoryId,80),
    categoryName:limited(body.categoryName,70),
    keyword:marketing(body.keyword),
    source:marketing(body.source)||'direct',
    medium:marketing(body.medium)||'none',
    campaign:marketing(body.campaign),
    referrerDomain:limited(body.referrerDomain,120),
    device:DEVICE.has(body.device)?body.device:'desktop',
    browser:BROWSER.has(body.browser)?body.browser:'Other',
    os:OS.has(body.os)?body.os:'Other',
    networkType:CONNECTION.has(body.networkType)?body.networkType:'unknown'
  };
}
export function acceptsAnalyticsOrigin(origin){
  if(typeof origin!=='string'||!origin)return false;
  try{
    const url=new URL(origin);
    if(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname))return true;
    if(url.protocol!=='https:')return false;
    return ['sanjusk.in','www.sanjusk.in','skcard.vercel.app'].includes(url.hostname)||
      /^skcard-[a-z0-9-]+\.vercel\.app$/.test(url.hostname);
  }catch{return false;}
}
export function analyticsWindow(value){
  const n=Number(value);
  return [7,30,90].includes(n)?n:30;
}
