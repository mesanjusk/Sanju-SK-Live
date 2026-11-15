import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanAnalyticsEvent,acceptsAnalyticsOrigin,isAnonymousId,analyticsWindow}
  from '../utils/growthAnalytics.js';

const record={
  visitorId:'80c3da5e-d25e-4eaf-b074-837daf2b99a5',
  sessionId:'5cf68acb-cf5d-4df6-9f5d-df93ec192b56',
  event:'product_view',path:'/products/abcdef0123456789abcdef01',
  productId:'abcdef0123456789abcdef01',categoryName:'Wedding Cards',
  device:'mobile',browser:'Chrome',os:'Android',networkType:'4g',
  source:'instagram',medium:'social',campaign:'november_sales',
  userAgent:'MUST_NOT_STORE',ip:'192.168.1.1',email:'private@example.com'
};
test('random IDs must conform to UUID format; no hardware IDs',()=>{
  assert.ok(isAnonymousId(record.visitorId));
  assert.equal(isAnonymousId('1699999999-abc'),false);
  assert.throws(()=>cleanAnalyticsEvent({...record,visitorId:'device-123'}));
});
test('allow only storefront origins (and localhost in development)',()=>{
  assert.equal(acceptsAnalyticsOrigin('https://www.sanjusk.in'),true);
  assert.equal(acceptsAnalyticsOrigin('https://skcard-abc123.vercel.app'),true);
  assert.equal(acceptsAnalyticsOrigin('http://localhost:5173'),true);
  assert.equal(acceptsAnalyticsOrigin('https://malicious.example'),false);
  assert.equal(acceptsAnalyticsOrigin('https://www.sanjusk.in.attacker.com'),false);
  assert.equal(acceptsAnalyticsOrigin(''),false);
});
test('strip unknown fields, prevent raw UA/IP and user PII in analytics records',()=>{
  const out=cleanAnalyticsEvent(record);
  assert.equal(out.visitorId,record.visitorId);
  assert.equal(out.productId,record.productId);
  assert.equal(out.categoryName,'Wedding Cards');
  assert.equal(out.browser,'Chrome');
  assert.equal(out.networkType,'4g');
  assert.equal(Object.hasOwn(out,'userAgent'),false);
  assert.equal(Object.hasOwn(out,'ip'),false);
  assert.equal(Object.hasOwn(out,'email'),false);
  assert.equal(cleanAnalyticsEvent({...record,keyword:'call 9876543210'}).keyword,'');
});
test('reject fabricated event names or sensitive private URL values',()=>{
  assert.throws(()=>cleanAnalyticsEvent({...record,event:'purchase_verified'}));
  assert.throws(()=>cleanAnalyticsEvent({...record,path:'/checkout?phone=9876543210'}));
  assert.throws(()=>cleanAnalyticsEvent({...record,path:'https://example.com'}));
  assert.equal(analyticsWindow(7),7);
  assert.equal(analyticsWindow(30),30);
  assert.equal(analyticsWindow(90),90);
  assert.equal(analyticsWindow(10000),30);
});
