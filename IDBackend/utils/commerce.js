import { createHmac, timingSafeEqual } from 'node:crypto';

/** Source of truth for checkout totals: never accept client-supplied prices. */
export function priceForQuantity(listing, quantity) {
  const q = Number(quantity);
  if (!Number.isSafeInteger(q) || q < 1 || q > 100000) throw new Error('Select a valid quantity.');
  const tiers = Array.isArray(listing.quantityPricing) ? listing.quantityPricing : [];
  const matching = tiers.filter(t => q >= Number(t.minQty) && (!t.maxQty || q <= Number(t.maxQty)))
    .sort((a,b)=>Number(b.minQty)-Number(a.minQty))[0];
  const unit = tiers.length ? Number(matching?.price) : Number(listing.price);
  if (!Number.isFinite(unit) || unit <= 0 || Math.abs(Math.round(unit*100)-unit*100)>0.00001) {
    throw new Error('Price needs confirmation. Please request a quote.');
  }
  const amountPaise=Math.round(unit * q * 100);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100 || amountPaise > 100000000) {
    throw new Error('This order needs a manual quotation.');
  }
  return {quantity:q,unitPrice:unit,amountPaise};
}
export function secureEqualHex(expected, given) {
  if (!/^[a-f\d]{64}$/i.test(String(given||''))) return false;
  const a=Buffer.from(expected,'hex'),b=Buffer.from(given,'hex');
  return a.length===b.length && timingSafeEqual(a,b);
}
export function isPaymentSignatureValid(orderId, paymentId, signature, secret) {
  if (!secret || !orderId || !paymentId) return false;
  const expected=createHmac('sha256',secret).update(orderId+'|'+paymentId).digest('hex');
  return secureEqualHex(expected,signature);
}
