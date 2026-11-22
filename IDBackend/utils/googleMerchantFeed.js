// Pure RSS serializer for the existing MongoDB Listing catalog.
import {withSeoSlug} from './productSeo.js';

const SITE='https://www.sanjusk.in';
const FORBIDDEN_IMAGE=/(?:^|[\/_-])(?:placeholder|no[-_]?image|coming[-_]?soon|dummy[-_]?image|default[-_]?product)(?:[\/_.-]|$)/i;
const NAMED={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};

export function xmlCharacters(input){
 let result='';
 for(const ch of String(input??'')){
  const n=ch.codePointAt(0);
  if(n===9||n===10||n===13||(n>=32&&n<=0xD7FF)||(n>=0xE000&&n<=0xFFFD)||(n>=0x10000&&n<=0x10FFFF))result+=ch;
 }
 return result;
}
export function textOnly(value){
 const decoded=String(value??'').replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi,(_match,key)=>{
  const v=key.toLowerCase();
  if(v.startsWith('#')){
   const n=v.startsWith('#x')?parseInt(v.slice(2),16):parseInt(v.slice(1),10);
   return Number.isInteger(n)&&n>=32&&n<=0x10FFFF?String.fromCodePoint(n):' ';
  }
  return NAMED[v]||' ';
 });
 return xmlCharacters(decoded.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
}
export const xmlEscape=value=>xmlCharacters(value).replace(/&/g,'&amp;')
 .replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export const cdata=value=>'<![CDATA['+xmlCharacters(value).replace(/]]>/g,']]]]><![CDATA[>')+']]>';
const shorten=(value,max)=>Array.from(value).slice(0,max).join('').trim();
const spam=/\b(?:BEST OFFER|MEGA SALE|LIMITED TIME OFFER|BIGGEST DISCOUNT|BUY NOW|FREE SHIPPING|SALE SALE|HOT DEAL)\b/gi;

export function merchantTitle(value){
 let title=textOnly(value).replace(spam,' ').replace(/[!]{2,}/g,'!').replace(/\s+/g,' ').trim();
 const letters=title.replace(/[^A-Za-z]/g,'');
 if(letters.length>=4&&letters===letters.toUpperCase()){
  title=title.toLowerCase().replace(/\b[a-z]/g,ch=>ch.toUpperCase())
   .replace(/\bLed\b/g,'LED').replace(/\b3d\b/gi,'3D')
   .replace(/\bPvc\b/g,'PVC').replace(/\bUv\b/g,'UV');
 }
 return shorten(title,150);
}
export function merchantImage(value){
 const candidates=Array.isArray(value)?value:[value];
 for(const candidate of candidates){
  if(typeof candidate!=='string')continue;
  try{
   const url=new URL(candidate.trim());
   if(url.protocol!=='https:'||!url.hostname||url.username||url.password)continue;
   if(FORBIDDEN_IMAGE.test(url.pathname)||/\.(?:svg|html?|pdf)$/i.test(url.pathname))continue;
   if(/^(?:localhost|127\.|0\.0\.0\.0)/i.test(url.hostname))continue;
   return url.toString();
  }catch{/* Ignore malformed image URLs. */}
 }
 return null;
}
// First valid min-quantity tier is what the Pinterest product card advertises.
export function merchantPrice(product){
 const original=Array.isArray(product.quantityPricing)?product.quantityPricing:[];
 const tiers=original.filter(t=>Number(t.minQty)>0&&Number(t.price)>0
   &&Number.isFinite(Number(t.price))).sort((a,b)=>Number(a.minQty)-Number(b.minQty));
 const chosen=tiers.length?tiers[0].price:original.length?null:product.price;
 const value=Number(chosen);
 if(chosen===null||chosen===undefined||chosen===''||!Number.isFinite(value)||value<=0||value>1e12)return null;
 return {amount:value.toFixed(2),minQty:tiers.length?Number(tiers[0].minQty):1};
}
const byId=(rows=[])=>new Map(rows.map(r=>[String(r._id),textOnly(r.name)]));
function categoryValue(raw,byIdMap){
 const key=String(raw?._id||raw||'');
 return byIdMap.get(key)||(/^[a-f0-9]{24}$/i.test(key)?'':textOnly(key));
}
export function merchantProductType(category,subcategory,title){
 const combined=[category,subcategory,title].join(' ');
 if(/wedding|invitation|shaadi/i.test(combined))
  return 'Wedding Invitations > '+(/laser[ -]?cut/i.test(combined)?'Laser Cut Cards':'Custom Wedding Cards');
 if(/(?:3d|led|channel letter|sign board|signage|neon|acrylic sign)/i.test(combined))
  return 'Printing & Signage > 3D LED Sign Boards';
 if(/troph|memento|award|medal/i.test(combined))
  return 'Awards & Mementos > '+(subcategory||category||'Custom Awards');
 if(/flex|banner|vinyl|hoarding|standee/i.test(combined))
  return 'Printing & Signage > Flex Banners';
 return shorten(['Custom Printing & Design',category,subcategory].filter(Boolean).join(' > '),750);
}
export function merchantItem(raw,categories=new Map(),subcategories=new Map()){
 if(!raw||raw.active===false||raw.published===false)return null;
 if(['draft','hidden','archived'].includes(String(raw.status||'').toLowerCase()))return null;
 let product;
 try{product=withSeoSlug(raw);}catch{return null;}
 const id=String(product._id||'').trim();
 const title=merchantTitle(product.title);
 const slug=String(product.slug||'');
 const image=merchantImage([...(Array.isArray(product.images)?product.images:[product.images]),product.imageUrl]);
 const price=merchantPrice(product);
 if(!id||id.length>50||!title||!slug||slug.length>150||
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!image||!price)return null;
 const category=categoryValue(product.category,categories);
 const subcategory=categoryValue(product.subcategory,subcategories);
 const type=merchantProductType(category,subcategory,title);
 const details=[textOnly(product.description||product.seoDescription||title)];
 if(textOnly(product.material))details.push('Material: '+textOnly(product.material));
 if(textOnly(product.size))details.push('Size: '+textOnly(product.size));
 if(textOnly(product.customizationDetails))details.push('Customization: '+textOnly(product.customizationDetails));
 if(subcategory)details.push('Style: '+subcategory);
 if(price.minQty>1)details.push('Listed unit price applies from '+price.minQty+' pieces.');
 details.push('Custom printing and personalization available from SANJU SK Digital, Gondia.');
 const description=shorten(details.join(' '),5000);
 const link=SITE+'/products/'+encodeURIComponent(slug);
 const attrs=[
  ['g:id',id],['g:title',title],['g:link',link],['g:image_link',image],
  ['g:availability','in_stock'],['g:price',price.amount+' INR'],
  ['g:condition','new'],['g:brand','SANJU SK Digital'],['g:identifier_exists','no'],
  ['g:product_type',type],['g:custom_label_0','Gondia Local']
 ];
 const body=attrs.map(([key,value])=>'      <'+key+'>'+xmlEscape(value)+'</'+key+'>').join('\n');
 return '    <item>\n'+body+'\n      <g:description>'+cdata(description)+'</g:description>\n    </item>';
}
export function buildGoogleMerchantXml(products,categories=[],subcategories=[]){
 if(!Array.isArray(products))throw new TypeError('Expected MongoDB listing array');
 const categoryNames=byId(categories),subcategoryNames=byId(subcategories);
 const items=products.map(p=>merchantItem(p,categoryNames,subcategoryNames)).filter(Boolean);
 return '<?xml version="1.0" encoding="UTF-8"?>\n'
  +'<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n'
  +'  <channel>\n'
  +'    <title>SANJU SK Digital Product Catalog</title>\n'
  +'    <link>'+SITE+'</link>\n'
  +'    <description>Custom Printing, Wedding Cards, 3D LED Sign Boards, Mementos &amp; Graphic Design in Gondia</description>\n'
  +items.join('\n')+(items.length?'\n':'')
  +'  </channel>\n</rss>\n';
}
