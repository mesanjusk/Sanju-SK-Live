import shared from '../lib/seo-server.cjs';
const {BACKEND,fetchWithDeadline}=shared;
let previous={xml:'',at:0};
export default async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method))return res.status(405).end();
 if(previous.xml && Date.now()-previous.at<120000){
  res.setHeader('Content-Type','application/xml; charset=utf-8');
  return res.status(200).send(req.method==='HEAD'?'':previous.xml);
 }
 try{
  let r=await fetchWithDeadline(BACKEND+'/sitemap.xml',10000);
  if(!r.ok)r=await fetchWithDeadline(BACKEND+'/sitemap.xml',12000);
  if(!r.ok)throw Error('Backend sitemap '+r.status);
  const xml=await r.text();
  if(!xml.startsWith('<?xml')||!xml.includes('<urlset')||!xml.includes('</urlset>'))throw Error('Invalid sitemap XML');
  previous={xml,at:Date.now()};
  res.setHeader('Content-Type','application/xml; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=3600');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(200).send(req.method==='HEAD'?'':xml);
 }catch(e){
  console.error('Sitemap proxy failed',e.message);
  if(previous.xml && Date.now()-previous.at<86400000){
   res.setHeader('Content-Type','application/xml; charset=utf-8');
   return res.status(200).send(req.method==='HEAD'?'':previous.xml);
  }
  res.setHeader('Retry-After','30');
  return res.status(503).send('Sitemap temporarily unavailable');
 }
}
