import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {priceForQuantity,isPaymentSignatureValid} from '../utils/commerce.js';

test('quantity-tier price is calculated exclusively from catalog',()=>{
 const catalog={price:12,quantityPricing:[
   {minQty:25,maxQty:99,price:10},{minQty:100,price:8}
 ]};
 assert.deepEqual(priceForQuantity(catalog,25),{quantity:25,unitPrice:10,amountPaise:25000});
 assert.deepEqual(priceForQuantity(catalog,120),{quantity:120,unitPrice:8,amountPaise:96000});
 assert.throws(()=>priceForQuantity(catalog,20),/Price needs confirmation/);
});
test('unsafe quantities and invalid price are rejected',()=>{
 assert.throws(()=>priceForQuantity({price:100},-2),/valid quantity/);
 assert.throws(()=>priceForQuantity({price:100},1.5),/valid quantity/);
 assert.throws(()=>priceForQuantity({price:0},12),/Price needs confirmation/);
});
test('Razorpay confirmation signature must match order and payment ID',()=>{
 const secret='test-secret',id='order_test_123',pay='pay_test_123';
 const signature=createHmac('sha256',secret).update(id+'|'+pay).digest('hex');
 assert.equal(isPaymentSignatureValid(id,pay,signature,secret),true);
 assert.equal(isPaymentSignatureValid(id,pay+'_changed',signature,secret),false);
 assert.equal(isPaymentSignatureValid(id,pay,'0'.repeat(64),secret),false);
 assert.equal(isPaymentSignatureValid(id,pay,signature,''),false);
});
