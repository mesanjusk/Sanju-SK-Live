// In-memory RSS XML cache, one-hour TTL. In-flight generations cannot revive
// stale data after an admin write invalidates the current revision.
export const MERCHANT_FEED_TTL_MS=60*60*1000;
let cached=null,working=null,revision=0;
export function invalidateGoogleMerchantFeed(){
 revision+=1;cached=null;working=null;
}
export async function getCachedGoogleMerchantFeed(build){
 if(cached&&Date.now()-cached.at<MERCHANT_FEED_TTL_MS)return cached.xml;
 if(working)return working;
 const generation=revision;
 const work=Promise.resolve().then(build).then(xml=>{
  if(typeof xml!=='string'||!xml.includes('</rss>'))throw Error('Invalid Merchant RSS XML generated');
  if(generation===revision)cached={xml,at:Date.now()};
  return xml;
 }).finally(()=>{if(working===work)working=null;});
 working=work;
 return work;
}
