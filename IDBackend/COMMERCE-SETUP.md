# SANJU SK Digital — Buy Now / UPI activation

The website uses the existing Pinterest-style catalog and a separate `/checkout` route.
Pricing and quantity are recalculated on the backend using `Listing` records.
The checkout never accepts a total supplied by the browser.

## Before accepting UPI payments
1. Activate a verified Razorpay merchant account and enable UPI for that account.
2. In the **Render backend service environment**, set `MONGO_URI`, a long random
   `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
   `RAZORPAY_WEBHOOK_SECRET`. **Never** place the key secret in Vercel VITE_ variables.
3. Register the Razorpay webhook at
   `https://sanju-sk-live.onrender.com/api/orders/webhook` and subscribe to
   `payment.captured`. Use the same webhook secret in Render.
4. Enable Razorpay automatic capture in the merchant dashboard, then perform
   test-mode end-to-end checkout and verify paid status in the admin Orders tab.
5. Set `PAYMENTS_ENABLED=true` **only after** those checks succeed. With the flag
   off, checkout offers a WhatsApp quotation and cannot initiate a payment.
6. Production launch requires shipping, GST/tax, refund policy and custom-artwork
   approval rules to be agreed and displayed to customers.

## Operational checks
- `GET /api/orders/config`: only returns whether merchant checkout is enabled.
- `POST /api/orders/checkout`: calculates server-side INR paise, opens a gateway order
  and saves pending order details.
- `POST /api/orders/verify`: checks HMAC signature **and** captured payment
  amount, currency and order identifier against Razorpay.
- `POST /api/orders/webhook`: verifies raw-body signature and reconciles captures.
- `GET /api/orders`: authenticated admins/managers only.
- `node --test tests/*.test.js`: verifies price tiers and payment signature checks.

An authorized-but-not-captured payment is NOT called paid. A pending verification
message must never be treated as proof of payment. The production backend must be
deployed from this branch/merge before the frontend payment flow can operate.

## Custom-order workflow
- Buy Now can save a **real quotation request** when payments are not activated.
- Admin **Orders & Payments** receives it in `new_order` status and records
  `design_in_progress -> awaiting_approval -> ready_for_print -> in_print ->
  post_print -> ready -> delivered`. On-hold and cancelled paths are explicit.
- A verified customer tracking key is returned on order creation. Customer can
  check only their own order and approve/reject their artwork proof.
- Before submitting artwork for approval, staff must upload a preview to the
  studio's Cloudinary account. The existing preview URL is used; do not link
  confidential files publicly without permission.
- Guest tracking keys must remain private; they are never in public search indexes.
- Staff can record offline collections with a bank/UPI reference. These are
  **manually recorded**, not automatically bank-verified.
- Order synchronisation to MISBoth is **opt-in** and separately configured. The
  studio must supply a real HTTPS receiving webhook and shared HMAC secret.

## Mandatory pricing sign-off before enabling UPI
All of these settings must exist in the Render **backend** environment:
`ORDER_PRICING_CONFIGURED=true`
`ORDER_PRICE_TAX_MODE=inclusive` or `exclusive`
`ORDER_GST_RATE_BPS=...` (e.g. 1800 means 18%, subject to accountant confirmation)
`ORDER_DELIVERY_FEE_PAISE=...` (e.g. 0 for truly free delivery)
plus the Razorpay merchant credentials and `PAYMENTS_ENABLED=true`.
Until every setting is present and valid, checkout must stay quote-only.
Prices are calculated from the catalog on the server; the checkout gets a
separate server estimate and refuses gateway totals that do not match it.

## Things that still require external accounts or owner approval
- Merchant KYC, Razorpay live UPI activation, bank settlement and test payment.
- Real tax treatment / GSTIN / invoice numbering, postal delivery tariff.
- Return/refund/cancellation policy specific to custom work and production stage.
- Secure customer artwork file hosting and external WhatsApp notification templates.
- A confirmed MISBoth receiver endpoint and Render workspace access.
- Device/browser acceptance tests against the deployed backend.

**Do not announce full e-commerce launch or test actual customer money until those
external dependencies are completed and end-to-end verified.**
