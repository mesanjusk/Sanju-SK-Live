# Hybrid commerce upgrade: phase 1 audit (2026-10-24)

Production: Vercel project `skcard`, domain `sanjusk.in`, GitHub `mesanjusk/Sanju-SK-Live`.
Implementation branch: `feature/hybrid-commerce-foundation-20261024`.

## Existing system
- Vite/React 18 SPA (`IDFrontend`), Express/Mongoose backend (`IDBackend`).
- Product listing and detail pages, tier-based quantity pricing, WhatsApp quote/order leads, admin catalog operations.
- Product SEO routes and generated landing pages via `IDFrontend/vercel.json`.
- Backend configured by frontend to `https://sanju-sk-live.onrender.com`.
- Existing `Cart.jsx` and `Checkout.jsx`, but `/cart` and `/checkout` redirect to `/products`.

## Checkout blockers
1. No `/api/orders` route registered in `IDBackend/index.js`, while dormant Checkout posts there.
2. The dormant Checkout accepts a client-supplied total and allows `paymentMode: online` without a payment gateway verification flow. **Do not enable it as-is.**
3. Cart uses product.price while product detail uses quantityPricing tiers; quotes could differ.
4. Cart did not survive page refresh; phase 1 adds scoped local-storage persistence and quantity validation.
5. Inventory, shipping, GST/tax, artwork approval, and order status data contracts must be defined before real checkout.

## Phase 1 implemented
- Persist draft cart in browser local storage with defensive parsing.
- Validate product identifiers and quantities before saving.
- Keep payment, checkout routes, pricing claims and existing WhatsApp funnel unchanged.
- Do not alter current production or rewrite URLs/SEO/admin.

## Next safe phases
1. Define order schema and separate `quote_required` versus `fixed_price` fulfillment.
2. Implement server-calculated quotes/orders, idempotent submission, authentication/authorization, rate limiting, validation, and audit trail.
3. Build an explicit customer cart and quotation screen with quantity-tier pricing.
4. Add payment gateway only after webhook signature verification, reconciliation and merchant onboarding.
5. Verify preview UI, backend/data contracts, SEO, mobile, and deploy only after explicit go-live approval.

## Verification checklist
- Run `npm ci` and `npm run build` from `IDFrontend`.
- Refresh the SPA with a draft cart and verify persistence.
- Verify invalid storage JSON and blocked storage do not crash.
- Verify `/cart` and `/checkout` still redirect safely; no online payments are enabled.
- Check product detail, listing, admin/login, sitemap, canonical metadata, mobile nav.
- Confirm Vercel preview READY; check deployed production SHA remains unchanged.
