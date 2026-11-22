import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {buildGoogleMerchantXml,merchantItem,merchantPrice,merchantTitle,xmlEscape,cdata} from '../utils/googleMerchantFeed.js';
import {getCachedGoogleMerchantFeed,invalidateGoogleMerchantFeed} from '../utils/googleMerchantCache.js';

const fixture={
 _id:'507f1f77bcf86cd799439011',
 title:'BEST OFFER ROYAL GOLD & LASER CUT WEDDING CARD',
 slug:'royal-gold-laser-cut-wedding-card-6cd799439011',active:true,
 images:['https://res.cloudinary.com/demo/image/upload/w_1200/example.jpg'],
 description:'<p>Gold &amp; cream cards <strong>size 5 x 7</strong> & custom text. ]]></p>',
 size:'5 x 7 inch',material:'Cardstock & Gold Foil',
 category:'507f1f77bcf86cd799439010',
 subcategory:'507f1f77bcf86cd799439012',
 quantityPricing:[{minQty:100,price:450},{minQty:500,price:400}],price:0
};
test('RSS 2.0 is well-formed UTF-8 XML with Google namespace and complete product data',()=>{
 const xml=buildGoogleMerchantXml([fixture],
  [{_id:fixture.category,name:'Wedding Cards'}],
  [{_id:fixture.subcategory,name:'Laser Cut Cards'}]);
 assert.match(xml,/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
 assert.match(xml,/<rss version="2.0" xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0">/);
 assert.match(xml,/<g:id>507f1f77bcf86cd799439011<\/g:id>/);
 assert.match(xml,/<g:price>450\.00 INR<\/g:price>/);
 assert.match(xml,/<g:link>https:\/\/www\.sanjusk\.in\/products\/royal-gold-laser-cut-wedding-card-6cd799439011<\/g:link>/);
 assert.match(xml,/<g:product_type>Wedding Invitations &gt; Laser Cut Cards<\/g:product_type>/);
 assert.match(xml,/<g:identifier_exists>no<\/g:identifier_exists>/);
 assert.match(xml,/<g:custom_label_0>Gondia Local<\/g:custom_label_0>/);
 assert.match(xml,/Material: Cardstock & Gold Foil/);
 assert.match(xml,/Size: 5 x 7 inch/);
 assert.match(xml,/<!\[CDATA\[[\s\S]*\]\]\]\]><!\[CDATA\[>/);
 assert.doesNotMatch(xml,/<g:title>BEST OFFER/);
 const external=xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g,'');
 assert.doesNotMatch(external,/&(?!amp;|lt;|gt;|quot;|apos;)/);
 assert.equal((xml.match(/<item>/g)||[]).length,1);
 // Python's standards-compliant ElementTree XML parser checks actual tag,
 // namespace, entity, CDATA and Unicode correctness (no npm XML dependency).
 const parse=spawnSync('python3',['-c',
  "import sys,xml.etree.ElementTree as ET; r=ET.fromstring(sys.stdin.buffer.read()); assert r.tag=='rss'; i=r.find('./channel/item'); n='{http://base.google.com/ns/1.0}'; assert i.find(n+'price').text=='450.00 INR'; assert ']]>' in i.find(n+'description').text; print('valid XML')"
 ],{input:Buffer.from(xml,'utf8'),encoding:'utf8'});
 assert.equal(parse.status,0,parse.stderr||String(parse.error));
});
test('zero price, unpublished, drafts, missing titles and invalid images are filtered',()=>{
 const invalid=[
  {...fixture,_id:'507f1f77bcf86cd799439013',price:0,quantityPricing:[]},
  {...fixture,_id:'507f1f77bcf86cd799439014',active:false},
  {...fixture,_id:'507f1f77bcf86cd799439015',published:false},
  {...fixture,_id:'507f1f77bcf86cd799439016',images:['http://example.com/image.jpg']},
  {...fixture,_id:'507f1f77bcf86cd799439017',images:['https://example.com/placeholder.jpg']},
  {...fixture,_id:'507f1f77bcf86cd799439018',title:'   '},
  {...fixture,_id:'507f1f77bcf86cd799439019',slug:'not safe/?'},
  {...fixture,_id:'507f1f77bcf86cd799439020',status:'draft'}
 ];
 const xml=buildGoogleMerchantXml(invalid);
 assert.equal((xml.match(/<item>/g)||[]).length,0);
 assert.doesNotMatch(xml,/<g:price>0\.00 INR<\/g:price>/);
});
test('first valid quantity tier matches card and PDP starting unit price',()=>{
 assert.deepEqual(merchantPrice(fixture),{amount:'450.00',minQty:100});
 assert.equal(merchantPrice({...fixture,quantityPricing:[{minQty:100,price:0}],price:200}),null);
 assert.equal(merchantPrice({...fixture,quantityPricing:[],price:0}),null);
 assert.equal(merchantPrice({...fixture,quantityPricing:[],price:100.5}).amount,'100.50');
});
test('title normalization, XML control characters, image fallback and escaped CDATA',()=>{
 assert.equal(xmlEscape('LED & <Signs>'),'LED &amp; &lt;Signs&gt;');
 assert.equal(merchantTitle('BEST OFFER 3D LED SIGN BOARD'),'3D LED Sign Board');
 assert.equal(cdata('A ]]> B'),'<![CDATA[A ]]]]><![CDATA[> B]]>');
 assert.equal(merchantItem({...fixture,images:[]}),null);
 assert.notEqual(merchantItem({...fixture,images:[],imageUrl:'https://example.com/photo.jpg'}),null);
 assert.equal(xmlEscape('a\u0000b'),'ab');
});
test('cache deduplicates requests and invalidates immediately after admin writes',async()=>{
 invalidateGoogleMerchantFeed();
 let calls=0;
 const builder=async()=>{calls+=1;return '<?xml version="1.0"?><rss></rss>';};
 const [a,b]=await Promise.all([getCachedGoogleMerchantFeed(builder),getCachedGoogleMerchantFeed(builder)]);
 assert.equal(a,b);assert.equal(calls,1);
 await getCachedGoogleMerchantFeed(builder);assert.equal(calls,1);
 invalidateGoogleMerchantFeed();
 await getCachedGoogleMerchantFeed(builder);assert.equal(calls,2);
 invalidateGoogleMerchantFeed();
});
test('in-flight responses cannot overwrite an invalidated Merchant XML cache',async()=>{
 invalidateGoogleMerchantFeed();
 let finish;
 const pending=getCachedGoogleMerchantFeed(()=>new Promise(resolve=>{finish=resolve;}));
 await Promise.resolve();
 invalidateGoogleMerchantFeed();
 const newXml='<?xml version="1.0"?><rss><channel>new</channel></rss>';
 await getCachedGoogleMerchantFeed(async()=>newXml);
 finish('<?xml version="1.0"?><rss><channel>old</channel></rss>');
 await pending;
 assert.equal(await getCachedGoogleMerchantFeed(()=>{throw Error('Must use current cache');}),newXml);
 invalidateGoogleMerchantFeed();
});
