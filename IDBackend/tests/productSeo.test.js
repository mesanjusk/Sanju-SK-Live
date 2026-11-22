import test from 'node:test';
import assert from 'node:assert/strict';
import {slugify,slugForListing,listingPath,withSeoSlug} from '../utils/productSeo.js';
test('stable slugs are unique for otherwise identical titles',()=>{
 const a=slugForListing('Royal Gold Laser-Cut Wedding Card','507f1f77bcf86cd799439011');
 const b=slugForListing('Royal Gold Laser-Cut Wedding Card','507f1f77bcf86cd799439012');
 assert.match(a,/^royal-gold-laser-cut-wedding-card-/);
 assert.notEqual(a,b);
 assert.equal(a,slugForListing('Royal Gold Laser-Cut Wedding Card','507f1f77bcf86cd799439011'));
});
test('legacy records get a deterministic fallback link',()=>{
 const p=withSeoSlug({_id:'507f1f77bcf86cd799439011',title:'3D LED & Acrylic Signs'});
 assert.match(listingPath(p),/^\/products\/3d-led-acrylic-signs-[a-f0-9]{12}$/);
 assert.equal(slugify('  Custom   Printing !! '),'custom-printing');
});
