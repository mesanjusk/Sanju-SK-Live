import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_GALLERY_HEIGHT_RATIO,largestGalleryHeightRatio} from './galleryAspect.mjs';

test('mixed wide, square and portrait images use the tallest width-normalized image',()=>{
  const dims=[{width:1200,height:650},{width:900,height:1700},
    {width:1000,height:1000}];
  assert.equal(largestGalleryHeightRatio(dims),1700/900);
  assert.equal(largestGalleryHeightRatio([...dims].reverse()),1700/900);
});
test('pixel-count is not mistakenly used to choose the display height',()=>{
  const dims=[{width:4000,height:2000},{width:650,height:1300}];
  assert.equal(largestGalleryHeightRatio(dims),2);
});
test('single image and unknown dimensions render safely',()=>{
  assert.equal(largestGalleryHeightRatio([{width:600,height:600}]),1);
  assert.equal(largestGalleryHeightRatio([]),DEFAULT_GALLERY_HEIGHT_RATIO);
  assert.equal(largestGalleryHeightRatio([{width:0,height:250}]),DEFAULT_GALLERY_HEIGHT_RATIO);
  assert.equal(largestGalleryHeightRatio([{width:200,height:1000}]),5);
  assert.equal(largestGalleryHeightRatio([{width:2000,height:300}]),0.55);
});
