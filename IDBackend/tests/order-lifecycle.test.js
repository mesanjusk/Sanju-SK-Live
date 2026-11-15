import test from 'node:test';
import assert from 'node:assert/strict';
import {canMoveOrder,cleanCustomer,cleanCustomization,makeTrackingToken,
  hashTrackingToken,publicOrderStatus} from '../utils/orderLifecycle.js';

test('artwork approval required before ready-for-print',()=>{
  assert.equal(canMoveOrder('new_order','ready_for_print','approved'),false);
  assert.equal(canMoveOrder('awaiting_approval','ready_for_print','awaiting_approval'),false);
  assert.equal(canMoveOrder('awaiting_approval','ready_for_print','approved'),true);
  assert.equal(canMoveOrder('ready','delivered','approved'),true);
  assert.equal(canMoveOrder('delivered','design_in_progress','approved'),false);
});
test('tracking token is unpredictable and only hash is persisted',()=>{
  const a=makeTrackingToken(),b=makeTrackingToken();
  assert.match(a.token,/^[0-9a-f]{64}$/);
  assert.notEqual(a.token,b.token);
  assert.notEqual(a.token,a.hash);
  assert.equal(hashTrackingToken(a.token),a.hash);
});
test('customer validation and customization limits',()=>{
  assert.throws(()=>cleanCustomer({name:'A',phone:'123'},false),/valid 10-digit/);
  assert.throws(()=>cleanCustomer({name:'Test',phone:'9876543210'},true),/address/);
  const person=cleanCustomer({name:' Customer ',phone:'9876543210',address:''},false);
  assert.equal(person.name,'Customer');
  assert.equal(cleanCustomization({size:'A4',artworkNotes:'x'.repeat(800)}).artworkNotes.length,500);
});
test('guest tracking response excludes customer PII, staff notes and tracking hash',()=>{
  const result=publicOrderStatus({
    _id:'1',title:'Wedding Cards',quantity:100,status:'pending_quote',
    workflowStatus:'design_in_progress',artworkStatus:'not_submitted',
    customer:{phone:'9876543210',name:'Private'},trackingTokenHash:'secret',
    adminNotes:'Private',history:[
      {event:'created',note:'Received',public:true,createdAt:new Date()},
      {event:'private',note:'Bank ref',public:false,createdAt:new Date()}
    ]
  });
  assert.equal(result.history.length,1);
  assert.equal('customer' in result,false);
  assert.equal('trackingTokenHash' in result,false);
  assert.equal('adminNotes' in result,false);
});
