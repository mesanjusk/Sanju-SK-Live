# SANJU SK Digital — Google Merchant Center RSS feed

**Public URL:** https://www.sanjusk.in/feeds/google-merchant.xml

**Backend:** GET /feeds/google-merchant.xml (Express, MongoDB Listing collection)

**Format:** RSS 2.0 with Google Merchant namespace, UTF-8 XML.

Only active/published listings with valid names, stable SEO slugs, HTTPS images
and positive displayed prices are exported. Quote-only and zero-price products
are intentionally excluded. The first valid quantity tier is the unit starting
price, matching the Pinterest storefront, and the minimum quantity is documented
in the product description.

Fields include id, title, HTML-free CDATA description, canonical link,
image_link, availability, price (INR), condition, brand, identifier_exists,
product_type, and custom_label_0.

The response is cached in-process for one hour. Successful admin writes to
listings, categories and subcategories invalidate the XML cache. Concurrent
refreshes are deduplicated. A 503 response is used if MongoDB is unavailable
and there is no valid cache; invalid or empty placeholder XML is never invented.
For multiple backend instances, each has its own in-memory cache.

The backend sends Cache-Control: no-store to protect against stale CDN copies.
The Vercel URL rewrites transparently to the Render origin.

**Image note:** URL syntax, HTTPS and obvious placeholder patterns are checked.
Actual HTTP accessibility, file dimensions and visual watermarks cannot be
guaranteed from the URL and must be checked in Merchant Center diagnostics.

**Merchant setup:** Submit the public feed URL in Merchant Center. Configure
shipping, returns and product eligibility according to your GMC account.
Unpriced made-to-quote services will not be included in this shopping feed.

**Tests:** node --test IDBackend/tests/googleMerchantFeed.test.js
The tests use Python 3 ElementTree to parse an actual generated XML sample.
Backend integration also requires MONGO_URI and a running MongoDB connection.
