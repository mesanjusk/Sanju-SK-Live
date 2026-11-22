// Use stable public slugs for discoverability while retaining MongoDB IDs internally.
export function productPath(product) {
 const key=product?.slug||product?._id;
 return '/products/'+encodeURIComponent(String(key||''));
}
export const productAbsoluteUrl=product=>'https://www.sanjusk.in'+productPath(product);
