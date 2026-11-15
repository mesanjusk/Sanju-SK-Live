import test from 'node:test';
import assert from 'node:assert/strict';
import {getPricingPolicy,calculateFinalPricing} from '../utils/orderPricing.js';

const product={price:30,quantityPricing:[{minQty:100,maxQty:199,price:30},{minQty:200,price:25}]};
test('missing merchant terms always force a quote',()=>{
  const policy=getPricingPolicy({});
  assert.equal(policy.configured,false);
  const result=calculateFinalPricing(product,100,policy);
  assert.equal(result.needsQuote,true);
  assert.equal(result.finalAmountPaise,null);
});
test('exclusive GST and fixed delivery are calculated once in integer paise',()=>{
  const policy=getPricingPolicy({
    ORDER_PRICING_CONFIGURED:'true',ORDER_GST_RATE_BPS:'1800',
    ORDER_DELIVERY_FEE_PAISE:'5000',ORDER_PRICE_TAX_MODE:'exclusive'
  });
  assert.equal(policy.configured,true);
  const total=calculateFinalPricing(product,100,policy);
  assert.equal(total.basePaise,300000);
  assert.equal(total.taxPaise,54000);
  assert.equal(total.deliveryPaise,5000);
  assert.equal(total.finalAmountPaise,359000);
});
test('inclusive tax is extracted from product amount, not added again',()=>{
  const policy=getPricingPolicy({
    ORDER_PRICING_CONFIGURED:'true',ORDER_GST_RATE_BPS:'1800',
    ORDER_DELIVERY_FEE_PAISE:'0',ORDER_PRICE_TAX_MODE:'inclusive'
  });
  const total=calculateFinalPricing(product,100,policy);
  assert.equal(total.finalAmountPaise,300000);
  assert.equal(total.taxPaise,Math.round(300000*1800/11800));
});
test('reject invalid tax and shipping terms, and unsupported quantity',()=>{
  assert.equal(getPricingPolicy({
    ORDER_PRICING_CONFIGURED:'true',ORDER_GST_RATE_BPS:'NaN',
    ORDER_DELIVERY_FEE_PAISE:'0',ORDER_PRICE_TAX_MODE:'exclusive'
  }).configured,false);
  assert.throws(()=>calculateFinalPricing(product,50,getPricingPolicy({})),/confirmation/);
});
