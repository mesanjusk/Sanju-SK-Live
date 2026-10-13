import { useEffect } from 'react';
import { SITE_URL } from '../config/site';

// Client-side route changes must update Product JSON-LD just like direct HTML requests.
export default function ProductStructuredData({ product }) {
  useEffect(() => {
    if (!product?._id || !product.title) return;
    const url = SITE_URL + '/products/' + product._id;
    const images = (Array.isArray(product.images) ? product.images : [product.images])
      .filter(item => typeof item === 'string' && /^https:\/\//.test(item)).slice(0,4);
    const flatPrice = Number(product.price);
    const tier = (product.quantityPricing || [])
      .filter(item => Number(item.price) > 0 && Number(item.minQty) > 0)
      .sort((a,b) => Number(a.price) - Number(b.price))[0];
    const hasFlatPrice = Number.isFinite(flatPrice) && flatPrice > 0;
    const price = hasFlatPrice ? flatPrice : (tier ? Number(tier.price) : 0);
    const markup = {
      '@context': 'https://schema.org', '@type': 'Product', '@id': url + '#product',
      name: product.title, sku: String(product._id), url,
      description: product.seoDescription || product.description || product.title,
      brand: {'@type':'Brand',name:'SANJU SK Digital – Mahi Creation'},
      ...(images.length ? {image: images} : {}),
      ...(price>0 ? {offers:{
        '@type':'Offer',url,priceCurrency:'INR',price,
        priceSpecification:{
          '@type':'UnitPriceSpecification', priceCurrency:'INR', price,
          referenceQuantity:{'@type':'QuantitativeValue',value:1,unitCode:'C62'},
          ...(!hasFlatPrice && tier ? {eligibleQuantity:{'@type':'QuantitativeValue',minValue:Number(tier.minQty),unitCode:'C62'}}:{})
        },
        seller:{'@type':'LocalBusiness','@id':SITE_URL+'/#business',name:'SANJU SK Digital – Mahi Creation'}
      }} : {})
    };
    let script=document.getElementById('sk-product-schema');
    if (!script) {
      script=document.createElement('script');
      script.type='application/ld+json';
      script.id='sk-product-schema';
      document.head.appendChild(script);
    }
    script.textContent=JSON.stringify(markup).replace(/</g,'\\u003c');
    return () => { script.remove(); };
  }, [product]);
  return null;
}
