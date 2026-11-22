import {useEffect} from 'react';
import {SITE_URL} from '../config/site';
import {productAbsoluteUrl} from '../utils/productUrl';
const escJson=value=>JSON.stringify(value).replace(/</g,'\\u003c');
function getPrice(p){
 const flat=Number(p.price);
 if(flat>0 && Number.isFinite(flat))return flat;
 const tiers=(Array.isArray(p.quantityPricing)?p.quantityPricing:[])
  .filter(x=>Number(x.price)>0 && Number(x.minQty)>0)
  .sort((a,b)=>Number(a.price)-Number(b.price));
 return tiers.length?Number(tiers[0].price):null;
}
export default function ProductStructuredData({product,categoryName}){
 useEffect(()=>{
  if(!product?._id||!product.title)return undefined;
  const url=productAbsoluteUrl(product);
  const image=(Array.isArray(product.images)?product.images:[product.images])
   .filter(Boolean).map(x=>x.startsWith('/')?SITE_URL+x:x)
   .filter(x=>/^https:\/\//.test(x)).slice(0,4);
  const price=getPrice(product);
  const productSchema={'@context':'https://schema.org','@type':'Product',
   '@id':url+'#product',name:product.title,url,
   sku:String(product.sku||product._id),
   ...(product.mpn?{mpn:String(product.mpn)}:{}),
   description:product.seoDescription||product.description||product.title,
   ...(categoryName?{category:categoryName}:{}),
   ...(image.length?{image}:{}),
   brand:{'@type':'Brand',name:'SANJU SK Digital'},
   ...(price!==null?{offers:{
    '@type':'Offer',url,priceCurrency:'INR',price,
    availability:'https://schema.org/InStock',
    seller:{'@type':'LocalBusiness','@id':SITE_URL+'/#business',name:'SANJU SK Digital – Mahi Creation'}
   }}:{})
  };
  const catUrl=SITE_URL+'/categories/'+(categoryName||'products')
   .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'/';
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',
   itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:SITE_URL+'/'},
    {'@type':'ListItem',position:2,name:categoryName||'Products',item:categoryName?catUrl:SITE_URL+'/products'},
    {'@type':'ListItem',position:3,name:product.title,item:url}
   ]};
  const ids=['sk-product-schema','sk-product-breadcrumb-schema'];
  [productSchema,breadcrumb].forEach((schema,i)=>{
   let node=document.getElementById(ids[i]);
   if(!node){node=document.createElement('script');node.type='application/ld+json';node.id=ids[i];document.head.appendChild(node);}
   node.textContent=escJson(schema);
  });
  return ()=>{ids.forEach(id=>document.getElementById(id)?.remove());};
 },[product,categoryName]);
 return null;
}
