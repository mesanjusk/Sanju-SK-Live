import test from 'node:test';
import assert from 'node:assert/strict';
import {interleavePinterestVideos} from './pinterestVideoFeed.mjs';
const products=Array.from({length:18},(_,i)=>({_id:'p'+i}));
const videos=[{_id:'v1',platform:'upload',videoUrl:'https://cdn.example.com/a.mp4'},
 {_id:'v2',platform:'youtube',youtubeUrl:'https://youtu.be/abcdefghijk'},
 {_id:'v3',platform:'instagram',instagramUrl:'https://instagram.com/reel/abc'}];
test('video pins are mixed into masonry without repeating photos or videos',()=>{
 const result=interleavePinterestVideos(products,videos,8);
 assert.equal(result.length,20);
 assert.deepEqual(result.filter(x=>x.kind==='video').map(x=>x.key),['video:v1','video:v2']);
 assert.deepEqual(result.filter(x=>x.kind==='product').map(x=>x.product._id),products.map(x=>x._id));
 assert.equal(result[8].kind,'video');
 assert.equal(result[17].kind,'video');
});
test('adding another batch preserves earlier items and skips insecure video sources',()=>{
 const one=interleavePinterestVideos(products.slice(0,9),videos,8);
 const next=interleavePinterestVideos(products,videos,8);
 assert.deepEqual(next.slice(0,one.length),one);
 const unsafe=interleavePinterestVideos(products,[{_id:'bad',platform:'upload',videoUrl:'http://example.com/x.mp4'}],8);
 assert.equal(unsafe.filter(x=>x.kind==='video').length,0);
 const badSocial=interleavePinterestVideos(products,[{
   _id:'hack',platform:'instagram',instagramUrl:'javascript:alert(1)'
 }],8);
 assert.equal(badSocial.filter(x=>x.kind==='video').length,0);
});
test('the feed remains products-only with no videos, and no duplicate video IDs',()=>{
 assert.equal(interleavePinterestVideos(products,[]).length,18);
 const dup=interleavePinterestVideos(products,[videos[0],videos[0],videos[1]],8);
 assert.deepEqual(dup.filter(x=>x.kind==='video').map(x=>x.key),['video:v1','video:v2']);
});
