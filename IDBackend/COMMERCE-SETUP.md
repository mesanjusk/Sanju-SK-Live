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
