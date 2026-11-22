# Product SEO Enrichment — slug-preserving, dry-run-first

**Schema:** IDBackend/models/Listing.js (mongoose.model('Listing')),
Category (name), Subcategory (name, categoryId). Listings have string
category and subcategory IDs, original title/description, existing slug,
material, size, customizationDetails, price and quantityPricing.

**Safety:** The script never includes slug in MongoDB update or unset operators.
It skips records without an existing stored slug, without a valid ObjectId, with
an existing originalTitle field, or with a sufficiently descriptive title.
For each changed record it stores originalTitle and originalDescription.
Updates atomically guard _id, title, slug, description and absence of originalTitle.
All changed IDs are re-queried and all original slugs compared. An independent
rollback mode restores original text without touching slug.

## Commands

Run inside IDBackend on a machine with appropriate environment.

* npm run enrich:examples — illustrative fifteen example products, zero DB/network I/O
* npm run enrich:preview-api — read-only GET of production public catalog,
  categories and subcategories, with no writes
* npm run enrich:preview — direct MongoDB dry-run with MONGO_URI set, fetches
  the entire catalog and prints the first fifteen category-diverse pairs
* node scripts/enrichCatalog.js --dry-run --limit=50 — additional preview rows
* node scripts/enrichCatalog.js --apply --confirm=I_APPROVE_ENRICHMENT —
  ONLY after explicit owner approval. Creates a local JSON backup before updates.
* node scripts/enrichCatalog.js --rollback --confirm=I_APPROVE_ENRICHMENT —
  restores original fields on rows enriched by script v1, never modifies slug.

## Cache behavior and validation

An independent CLI process cannot clear another process's JavaScript memory.
The approved CLI increments a durable MongoDB CatalogCacheRevision document
after each changed batch; the Merchant feed, SEO index, and XML sitemap read
the revision before serving cached bodies. Vercel product sitemap now sends
Cache-Control: no-store to avoid outdated CDN XML.

The optional upload helper enriches new listings only, using the same conservative
rule engine and preserving the originally submitted title. It never rewrites
stored slugs on existing documents.

XML URLs:
* https://www.sanjusk.in/feeds/google-merchant.xml
* https://www.sanjusk.in/sitemap-products.xml

After approved apply, the script attempts HTTP fetches and XML parsing using
Python 3. Failed HTTP/parse checks are explicitly reported as NOT VERIFIED.
