import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createSeoPreview,needsSeoEnrichment,proposedTitle,proposedDescription} from '../utils/enrichListingSeo.js';
import {buildGoogleMerchantXml} from '../utils/googleMerchantFeed.js';

const ids=i=>'507f1f77bcf86cd7994390'+String(i).padStart(2,'0');
const names=['Icard','Housie','Housie Tickets','Cutout','Cones','Tag','Badges',
 'Floral','Acrylic','Welcome Board','Playing Cards','Memento','Acrylic','Visiting Cards','Envelopes'];
const namesCat=['Office Stationery','Wedding Cards','Wedding Cards','Event Printing',
 'Wedding Accessories','Corporate Stationery','Corporate Stationery','Wedding Cards',
 'Wedding Cards','Wedding Signage','Wedding Accessories','Corporate Gifts','Signage','Business Printing','Wedding Cards'];
const products=names.map((title,i)=>({
 _id:ids(i+1),slug:'existing-slug-'+String(i+1).padStart(2,'0'),title,
 description:title,category:namesCat[i],
 price:450,quantityPricing:[{minQty:100,price:450}],
 images:['https://res.cloudinary.com/demo/image/upload/example.jpg']
}));
test('15 representative products produce 45–85 character unique titles and 150–300 character descriptions',()=>{
 const result=createSeoPreview(products);
 assert.equal(result.length,15);
 assert.equal(new Set(result.map(r=>r.category+'\u0000'+r.afterTitle)).size,15);
 for(const r of result){
  assert.ok(r.afterTitle.length>=45&&r.afterTitle.length<=85,r.afterTitle);
  assert.ok(r.afterDescription.length>=150&&r.afterDescription.length<=300,r.afterDescription);
  assert.ok(r.afterDescription.includes('Gondia, Maharashtra with pan-India delivery'));
  assert.ok(!/Best Price|Buy Now|BEST OFFER/i.test(r.afterTitle));
  assert.equal(r.slug,products.find(p=>String(p._id)===r.id).slug);
  assert.ok(r.afterDescription.includes('MOQ 100 pieces at ₹450.00 per piece'));
 }
 const repeats=createSeoPreview(products);
 assert.deepEqual(repeats,result,'Same data must always give the same proposals');
});
test('existing originalTitle, informative titles and missing slugs are never eligible',()=>{
 const sample=products[0];
 assert.equal(needsSeoEnrichment({...sample,originalTitle:'Icard'}),false);
 assert.equal(needsSeoEnrichment({...sample,originalTitle:''}),false);
 assert.equal(needsSeoEnrichment({...sample,slug:''}),false);
 assert.equal(needsSeoEnrichment({...sample,slug:undefined}),false);
 assert.equal(needsSeoEnrichment({...sample,title:'Personalized Premium Printing for Major Corporate Events'}),false);
});
test('brand context, category, material and duplicates remain descriptive',()=>{
 const floral=products.find(p=>p.title==='Floral');
 assert.match(proposedTitle(floral,'Wedding Cards','Floral Designs'),/Wedding Invitation/);
 const acrylic=products.find(p=>p.title==='Acrylic');
 assert.match(proposedTitle(acrylic,'Wedding Cards','Acrylic Invitations'),/Wedding Invitation/);
 const rows=createSeoPreview(products);
 const same=rows.filter(r=>r.beforeTitle.startsWith('Housie'));
 assert.notEqual(same[0].afterTitle,same[1].afterTitle);
 assert.ok(same.every(r=>/Design 0[12]$/.test(r.afterTitle)));
});
test('enriched output remains valid in Google Merchant XML and canonical URLs remain unchanged',()=>{
 const rows=createSeoPreview(products);
 const patches=new Map(rows.map(r=>[r.id,r]));
 const enriched=products.map(p=>{
  const row=patches.get(String(p._id));
  return {...p,title:row.afterTitle,description:row.afterDescription};
 });
 const xml=buildGoogleMerchantXml(enriched);
 assert.equal((xml.match(/<item>/g)||[]).length,15);
 for(let i=1;i<=15;i++)assert.ok(xml.includes('/products/existing-slug-'+String(i).padStart(2,'0')));
 assert.doesNotMatch(xml,/<g:title>[^<]*&(?!amp;)/);
 const p=spawnSync('python3',['-c',"import sys,xml.etree.ElementTree as ET; r=ET.fromstring(sys.stdin.read()); assert len(r.findall('./channel/item'))==15;print('XML well-formed')"],{input:xml,encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
});
test('descriptions never insert non-existent pricing when product is quote-only',()=>{
 const doc=proposedDescription({...products[0],price:0,quantityPricing:[]},
  'Custom PVC School & Office ID Card Printing with Lanyard');
 assert.ok(doc);
 assert.doesNotMatch(doc,/₹|MOQ/);
});
