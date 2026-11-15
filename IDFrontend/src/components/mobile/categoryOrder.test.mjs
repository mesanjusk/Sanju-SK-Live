import test from 'node:test';
import assert from 'node:assert/strict';
import {orderStoreCategories,landingKeyword,isWeddingCategory} from './categoryOrder.mjs';
const categories=[
  {name:'Trophy',_id:'t'},{name:'Flex Banner',_id:'f'},
  {name:'Wedding Cards',_id:'w'},{name:'Birthday',_id:'b'},
  {name:'Signage',_id:'s'}
];
test('Wedding remains first under any seed and other categories are not duplicated',()=>{
  for(const seed of ['123','abc','98']){
    const ordered=orderStoreCategories(categories,{seed});
    assert.equal(ordered[0]._id,'w');
    assert.deepEqual(new Set(ordered.map(c=>c._id)),new Set(categories.map(c=>c._id)));
  }
});
test('referrer or UTM intent gives matching category priority after Wedding',()=>{
  const ordered=orderStoreCategories(categories,{seed:'42',keyword:'acrylic signage'});
  assert.equal(ordered[0]._id,'w');
  assert.equal(ordered[1]._id,'s');
  assert.equal(landingKeyword('?utm_term=flex%20banner'),'flex banner');
  assert.equal(landingKeyword('','https://www.google.com/search?q=birthday+design'),'birthday design');
});
test('stable under same seed and detects wedding aliases',()=>{
  assert.deepEqual(orderStoreCategories(categories,{seed:'77'}),
    orderStoreCategories(categories,{seed:'77'}));
  assert.equal(isWeddingCategory({name:'Vivah Invitation'}),true);
});
