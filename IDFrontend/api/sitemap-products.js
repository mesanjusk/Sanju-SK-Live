import shared from '../lib/seo-server.cjs';
const { BACKEND, SITE_URL, esc, isId, fetchWithDeadline }=shared;
export default async function handler(req,res) {
  if(req.method!=='GET'&&req.method!=='HEAD')return res.status(405).end();
  try {
    const response=await fetchWithDeadline(BACKEND+'/api/listings',20000);
    if(!response.ok)throw Error('Product API status '+response.status);
    const body=await response.json();
    const products=Array.isArray(body)?body:Array.isArray(body?.result)?body.result:[];
    // A sitemap must not silently advertise an empty collection when the API has failed.
    if(!Array.isArray(products))throw Error('Invalid collection response');
    const unique=[...new Set(products.map(p=>String(p?._id||'')).filter(isId))].slice(0,45000);
    const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
      unique.map(id=>'  <url><loc>'+esc(SITE_URL+'/products/'+id)+'</loc></url>').join('\n')+
      '\n</urlset>\n';
    res.setHeader('Content-Type','application/xml; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');
    res.setHeader('X-Content-Type-Options','nosniff');
    return res.status(200).send(req.method==='HEAD'?'':xml);
  }catch(error){
    console.error('Product sitemap request failed:',error.message);
    res.setHeader('Cache-Control','no-store');
    return res.status(503).send('Product sitemap temporarily unavailable');
  }
}
