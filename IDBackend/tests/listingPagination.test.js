import test from 'node:test';
import assert from 'node:assert/strict';
import {parseListingPage} from '../utils/listingPagination.js';

test('18 items per initial page and bounded subsequent pages',()=>{
 assert.deepEqual(Object.entries(parseListingPage({})).filter(([k])=>['page','limit','skip'].includes(k)),[['page',1],['limit',18],['skip',0]]);
 const p=parseListingPage({page:'2',limit:'18'});
 assert.equal(p.skip,18);
 assert.equal(p.limit,18);
 assert.deepEqual(p.sort,{createdAt:-1,_id:-1});
 const last=parseListingPage({page:'3',limit:'9999'});
 assert.equal(last.limit,30);
 assert.equal(last.skip,60);
});
test('session direction and deterministic tiebreaking prevent pagination duplicates',()=>{
 assert.deepEqual(parseListingPage({direction:'asc'}).sort,{createdAt:1,_id:1});
 assert.deepEqual(parseListingPage({direction:'desc'}).sort,{createdAt:-1,_id:-1});
 assert.deepEqual(parseListingPage({sort:'price-asc'}).sort,{price:1,_id:1});
 assert.deepEqual(parseListingPage({sort:'price-desc'}).sort,{price:-1,_id:-1});
});
test('search, category, subcategory and religion applied safely before pagination',()=>{
 const {filter}=parseListingPage({category:'cat1,cat2',subcategory:'sub1',
  subcategoryName:'Laser Cut',religion:'Wedding',search:'foo.*'});
 assert.deepEqual(filter.category,{$in:['cat1','cat2']});
 assert.deepEqual(filter.subcategory,{$in:['sub1','Laser Cut']});
 assert.equal(filter.religions,'Wedding');
 assert.equal(filter.$or.length,4);
 assert.ok(filter.$or.every(v=>Object.values(v)[0].test('foo.* printing')));
 assert.ok(filter.$or.every(v=>!Object.values(v)[0].test('foo-x printing')));
});
test('invalid pagination values cannot cause unlimited scans',()=>{
 const p=parseListingPage({page:'-50',limit:'NaN',category:',,'});
 assert.equal(p.page,1);
 assert.equal(p.limit,18);
 assert.equal(p.filter.category,undefined);
 assert.ok(parseListingPage({page:'99999999'}).skip<=999*18);
});
