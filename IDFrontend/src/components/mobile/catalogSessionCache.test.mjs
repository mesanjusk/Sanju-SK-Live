import test from 'node:test';
import assert from 'node:assert/strict';
import {clearCatalogCache,rememberCatalogRows,readCatalogRows,isCatalogCacheFresh}
 from './catalogSessionCache.mjs';
test('public catalog is cached in memory and used on return',()=>{
  clearCatalogCache();
  const data=[{title:'Wedding card',_id:'a'}];
  assert.equal(rememberCatalogRows('listings',data),true);
  assert.deepEqual(readCatalogRows('listings'),data);
  assert.equal(isCatalogCacheFresh('listings'),true);
  clearCatalogCache();
  assert.equal(readCatalogRows('listings'),null);
});
