#!/usr/bin/env node
/**
 * build-catalog.mjs — STANDALONE catalog builder for Mindful Luxury Emporium.
 * Converts store/yumi-shopify-products-raw.json (Shopify REST products.json
 * snapshot, fetched 2026-09-11) into src/data/catalog.json in the same node
 * shape the routes already parse (Storefront-API-like), plus a server-side
 * price book for the Netlify checkout function.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "store/yumi-shopify-products-raw.json");
const OUT = path.join(ROOT, "src/data/catalog.json");
const PRICES = path.join(ROOT, "netlify/functions/data/mle-prices.json");

const productsRaw = fs.readFileSync(RAW, "utf8");
const products = JSON.parse(productsRaw.replace(/^\uFEFF/, ""));

const catalog = products.map((p) => {
  const firstVariant = p.variants?.[0] ?? {};
  const images = (p.images ?? []).map((img, i) => ({
    node: { url: img.src, altText: p.title ?? null },
    ...(i === 0 ? {} : {}),
  }));
  const priceAmount = firstVariant.price ?? "0.00";
  return {
    node: {
      id: `gid://shopify/Product/${p.id}`,
      title: p.title,
      description: p.body_html ?? "",
      handle: p.handle,
      productType: p.product_type ?? "",
      tags: p.tags ?? [],
      vendor: p.vendor ?? "Yu+Mi",
      priceRange: { minVariantPrice: { amount: priceAmount, currencyCode: "AUD" } },
      images: { edges: images.map((img) => ({ node: img.node })) },
      variants: {
        edges: (p.variants ?? []).map((v) => ({
          node: {
            id: `gid://shopify/ProductVariant/${v.id}`,
            title: v.title ?? "Default Title",
            price: { amount: v.price ?? priceAmount, currencyCode: "AUD" },
            availableForSale: v.available !== false,
            selectedOptions: (p.options ?? []).map((opt, oi) => ({
              name: opt.name,
              value: v[`option${oi + 1}`] ?? opt.values?.[0] ?? "Default Title",
            })),
          },
        })),
      },
      options: (p.options ?? []).map((opt) => ({ name: opt.name, values: opt.values ?? [] })),
    },
  };
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

// Server-side price book (handle -> cents) for the checkout function.
const prices = {};
for (const e of catalog) {
  const n = e.node;
  const v = n.variants.edges[0]?.node;
  if (!v) continue;
  prices[n.handle] = {
    variantId: String(v.id),
    title: n.title,
    category: n.productType,
    amountCents: Math.round(parseFloat(v.price.amount) * 100),
    currency: "aud",
    image: n.images.edges[0]?.node.url ?? "",
  };
}
fs.mkdirSync(path.dirname(PRICES), { recursive: true });
fs.writeFileSync(PRICES, JSON.stringify(prices, null, 2));
console.log(`catalog: ${catalog.length} products -> ${OUT}`);
console.log(`prices: ${Object.keys(prices).length} -> ${PRICES}`);
