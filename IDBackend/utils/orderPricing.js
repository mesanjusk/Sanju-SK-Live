import {priceForQuantity} from './commerce.js';

// Merchant-controlled pricing configuration. Missing terms mean quote-only.
// No estimated GST, courier charges, or invented inclusive-tax assumptions.
export function getPricingPolicy(env=process.env){
  const taxBps=Number(env.ORDER_GST_RATE_BPS);
  const deliveryPaise=Number(env.ORDER_DELIVERY_FEE_PAISE);
  const mode=env.ORDER_PRICE_TAX_MODE;
  const configured=env.ORDER_PRICING_CONFIGURED==='true' &&
    env.ORDER_GST_RATE_BPS!==undefined && env.ORDER_DELIVERY_FEE_PAISE!==undefined &&
    Number.isSafeInteger(taxBps) && taxBps>=0 && taxBps<=2800 &&
    Number.isSafeInteger(deliveryPaise) && deliveryPaise>=0 && deliveryPaise<=5000000 &&
    ['inclusive','exclusive'].includes(mode);
  return {configured,taxBps,deliveryPaise,mode};
}
export function calculateFinalPricing(listing,quantity,policy=getPricingPolicy()){
  const base=priceForQuantity(listing,quantity);
  const basePaise=base.amountPaise;
  if(!policy.configured)return {...base,basePaise,needsQuote:true,taxPaise:null,deliveryPaise:null,
    finalAmountPaise:null};
  const taxPaise=policy.mode==='inclusive'
    ? Math.round(basePaise*policy.taxBps/(10000+policy.taxBps))
    : Math.round(basePaise*policy.taxBps/10000);
  const finalAmountPaise=basePaise+(policy.mode==='exclusive'?taxPaise:0)+policy.deliveryPaise;
  if(!Number.isSafeInteger(finalAmountPaise)||finalAmountPaise>100000000)
    throw new Error('This order requires a confirmed manual quotation.');
  return {...base,basePaise,needsQuote:false,taxPaise,deliveryPaise:policy.deliveryPaise,
    finalAmountPaise,taxIncluded:policy.mode==='inclusive'};
}
