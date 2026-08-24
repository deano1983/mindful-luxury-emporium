// NDV / Yu+Mi — DSers product-mapping CSV export (read-only, Storefront API).
// Pulls every live product: numeric Shopify product ID, title, handle, and any
// supplier link found in custom.supplier_url metafield or product description.
// Usage: node scripts/export-dsers-mapping.mjs <shop-domain> <storefront-token> <out.csv>
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const [SHOP, TOKEN, OUT] = process.argv.slice(2);
if (!SHOP || !TOKEN || !OUT) {
  console.error("Usage: node export-dsers-mapping.mjs <shop-domain> <storefront-token> <out.csv>");
  process.exit(1);
}
const API = `https://${SHOP}/api/2025-07/graphql.json`;

const QUERY = `
  query Export($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title handle description
          vendor productType tags
          metafields(identifiers: [
            {namespace:"custom", key:"supplier_url"},
            {namespace:"custom", key:"supplier_name"}
          ]) { key value }
        }
      }
    }
  }
`;

async function gql(query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join("; "));
  return json.data;
}

const products = [];
let cursor = null;
for (;;) {
  const data = await gql(QUERY, { cursor });
  for (const { node } of data.products.edges) products.push(node);
  if (!data.products.pageInfo.hasNextPage) break;
  cursor = data.products.pageInfo.endCursor;
}

// Extract supplier info: metafield first, then any aliexpress URL hiding in the description.
const AEX_RE = /https?:\/\/(?:[a-z0-9-]+\.)*aliexpress\.(?:com|us)\/item\/\d{6,}\.html[^\s"'<>)]*/gi;
function supplierInfo(p) {
  let url = "";
  let name = "";
  for (const m of p.metafields || []) {
    if (!m || !m.value) continue;
    if (m.key === "supplier_url" && !url) url = m.value.trim();
    if (m.key === "supplier_name" && !name) name = m.value.trim();
  }
  if (!url) {
    const found = (p.description || "").match(AEX_RE);
    if (found) url = found[0];
  }
  // canonical form: strip tracking query strings
  if (url) {
    const m = url.match(/^(https?:\/\/(?:[a-z0-9-]+\.)*aliexpress\.(?:com|us)\/item\/\d{6,}\.html)/i);
    if (m) url = `https://www.aliexpress.com/item/${m[1].match(/(\d{6,})\.html/)[1]}.html`;
  }
  return { url, name };
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

products.sort((a, b) => a.handle.localeCompare(b.handle));

const headers = ["STORE PRODUCT ID", "STORE PRODUCT NAME", "STORE PRODUCT HANDLE", "SUPPLIER PRODUCT NAME", "SUPPLIER PRODUCT URL"];
const rows = products.map(p => {
  const id = (p.id.match(/\/Product\/(\d+)/) || [])[1] || p.id;
  const sup = supplierInfo(p);
  return [id, p.title, p.handle, sup.name, sup.url].map(csvEscape).join(",");
});

const csv = headers.join(",") + "\r\n" + rows.join("\r\n") + "\r\n";
await mkdir(path.dirname(path.resolve(OUT)), { recursive: true });
await writeFile(OUT, csv, "utf8");

const mapped = products.filter(p => supplierInfo(p).url).length;
console.log(`Shop:      ${SHOP}`);
console.log(`Products:  ${products.length}`);
console.log(`Mapped:    ${mapped} (supplier URL found) / ${products.length - mapped} (blank supplier columns)`);
console.log(`Out:       ${path.resolve(OUT)} (${(csv.length / 1024).toFixed(1)} KB)`);
