# Product Context — Yu+Mi · A.D.H.D

## Why this exists
Yu+Mi + A.D.H.D is a luxury shopping experience for wealthy neurodivergent MEN (18–55).
Sister brand of NDV (Neurodivergence / Nouveau Dames Vault — the women's label at C:\dev\ndv).
Products: luxury name-brand fashion, accessories, personal electronics, bedding, and
miscellaneous objects — each with a primary or secondary function of blocking/lessening
external stimuli (tactile-friendly materials, sensory regulation, focus aids).

## Experience goals
- Noir + Gold palette (never pastel), low-stimulation, quiet luxury.
- Typography: Cormorant Garamond (display) + Inter (sans).
- Copy voice: quiet, precise, considerate. No urgency/spam patterns.

## Catalog: 100 products, 20 per category (see mem/index.md)
1. Fashion (tag `fashion`) — tactile-considered menswear
2. Fashion Accessories (`accessories`) — 10 iced moissanite + 10 designer eyewear
3. Personal Electronics (`electronics`) — stimulus-shaping audio/wearables
4. Bedding & Sanctuary (`bedding`) — weighted blankets, silk, regulating
5. Objects & Play (`objects`) — high-end fidget/focus objects

SKU scheme: YM-{F|A|E|B|M}-###. Margin baseline: 40% COGS → 60% gross.

## Commerce backend
Shopify store: yu-mi-a-d-h-d-sanctuary-zd6hf.myshopify.com
Storefront API token is hardcoded in src/lib/shopify.ts (public-by-design token, safe to commit).

## Surfaces
- **Web** (TanStack Start SSR, Lovable-connected: https://mindful-luxury-emporium.lovable.app)
- **Native app** (Capacitor 8 shell around SPA build) — catalog/cart/checkout via
  client-side Shopify Storefront API. Same architecture as NDV.
