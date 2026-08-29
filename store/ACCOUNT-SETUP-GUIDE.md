# Account & Shipping Setup Guide — NDV family (29/08/2026)

## ⚠️ URGENT — NDV Shopify plan has lapsed
The NDV Shopify Storefront API returns **HTTP 402 "Unavailable Shop"** — the store is not
on an active paid plan. Consequence: **ndvluxury.com.au shows no products and checkout is
broken** until the plan is restored.
Action: https://admin.shopify.com → Settings → Plan → pick a plan / settle the outstanding
bill. (The Yu+Mi ADHD store is healthy — API pulls fine.)

## Shipping rates (Shopify Admin — Settings → Shipping and delivery)
Create one shipping profile with general rates for Australia (+ Rest of world):
- **Standard tracked** — 10–20 business days — **AUD 12.90**
- **Express tracked** — 5–8 business days — **AUD 24.90**
- Optional: free Standard over **AUD 150** (order-discount or automatic free-shipping rule).
Apply the same two rates in BOTH healthy Shopify stores (Yu+Mi now; NDV once the plan is
restored). Lil NDV (Stripe, not Shopify) already has flat **US$6.95 standard / US$14.95
express** wired into its checkout (`src/lib/shipping.ts`) — adjust there if you want AUD.

## DSers product mapping (individually named CSVs, ready)
- **Lil NDV** — `C:\dev\lil-ndv\store\lil-ndv-dsers-product-mapping.csv` — 143/143 rows
  **COMPLETE** (supplier product name + AliExpress URL on every row). Import-ready today.
- **NDV** — `C:\dev\ndv\store\ndv-dsers-product-mapping.csv` — 80 rows, supplier columns
  blank (source URLs were never recorded at import time; Shopify API currently 402).
- **Yu+Mi ADHD** — `C:\dev\mindful-luxury-emporium\store\yumi-adhd-dsers-product-mapping.csv`
  — 93 rows (fresh pull 29/08), supplier columns blank.

### How to fill the blank supplier columns
Option A (no code): DSers → Product Mapping → search each product by image, paste the
matching AliExpress URL into the CSV or into the Shopify product's `custom.supplier_url`
metafield — then re-run `node scripts/export-dsers-mapping.mjs <shop> <token> <out.csv>`
(it auto-fills from that metafield or any URL in the description).
Option B (automated): supply the **LOVABLE_API_KEY + FIRECRAWL_API_KEY** (from your Lovable
account settings) — the NDV repo already contains a tuned resolver
(`src/lib/aliexpress-resolver.functions.ts`: search cascade + ≥50% title-token match +
mismatch blacklist) that can be run locally to auto-fill both stores.

## Final account checklist (user actions, in priority order)
1. **NDV Shopify plan renewal** (URGENT — site is dark until paid).
2. **Google Play developer account ($25)** → upload the three signed AABs:
   `au.com.ndvluxury` (NDV), `au.com.yumiadhd` (Yu+Mi), `au.com.lilndv` (Lil NDV).
3. **Apple Developer ($99)** → iOS CI workflows are ready in all three repos (push → archive).
4. **Stripe keys for Lil NDV** (`STRIPE_SECRET_KEY` etc.) — card checkout; note the NDIS
   pay-by-invoice flow already works without Stripe.
5. Optional: custom domains (lil-ndv.netlify.app → lilndv.com.au; Yu+Mi custom domain).
6. Optional: NDIS provider registration (agency-managed participants).

## What can be automated from here (no browser needed)
- **Shopify Admin API token** (custom app → `shpat_...`): shipping rates can be set
  programmatically, product data + supplier metafields can be read/written directly.
- **Lovable + Firecrawl keys**: supplier URL auto-resolution for NDV + Yu+Mi.
This environment has read-only web fetch (no login/JS browser), so portal clicks
(Play/Apple/DSers dashboards) must be yours — everything data-side can be mine.

