#!/usr/bin/env node
/**
 * resolve-suppliers-direct.mjs — KEYLESS best-match AliExpress supplier resolver.
 *
 * Complements scripts/resolve-suppliers.mjs (which needs LOVABLE_API_KEY +
 * FIRECRAWL_API_KEY). This one needs NO API KEYS: it fetches AliExpress's public
 * search pages directly and parses the embedded itemList JSON.
 *
 * Node >= 18 (global fetch). Resumeable via --cache dir.
 *
 * Usage:
 *   node scripts/resolve-suppliers-direct.mjs \
 *     --csv store/ndv-dsers-mapping-full-v5.csv \
 *     --profile ndv \
 *     [--restrict store/ndv-dsers-product-mapping.csv] \
 *     [--out store/ndv-dsers-product-mapping.csv] \
 *     [--json src/data/sourcing/dsers-resolved.json] \
 *     [--cache .sourcing-cache] [--limit N]
 */
import fs from "node:fs";
import path from "node:path";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-AU,en;q=0.9",
};

// Brand-tuned profiles (yumi = men's catalog: reject women/kids in candidates).
const PROFILES = {
  ndv: { reject: ["men", "mens", "boy", "boys", "kids", "children", "child"], keepBrandWords: true },
  yumi: { reject: ["women", "womens", "girl", "girls", "kid", "kids", "children", "boys", "girls"], keepBrandWords: true },
  kids: { reject: ["women", "womens", "men", "mens", "girl", "girls"], keepBrandWords: true },
  generic: { reject: [], keepBrandWords: true },
};

const BRAND_NOISE = new Set([
  "ndv", "yu", "mi", "yumi", "kidiverse", "lil", "the", "and", "with", "for",
  "new", "pack", "pcs",
]);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) args[k.slice(2)] = argv[i + 1] ?? "true";
    i++;
  }
  return args;
}

/** Minimal RFC4180-ish CSV parser (quoted fields, embedded commas/quotes/newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function detectColumns(header) {
  const find = (...needles) => {
    const lower = header.map((h) => h.toLowerCase());
    for (const n of needles) {
      const idx = lower.findIndex((h) => h.includes(n));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  return {
    id: find("store product id", "shopify product id", "product id"),
    title: find("ndv title", "store product name", "product title", "title"),
    handle: find("shopify handle", "store product handle", "handle"),
    sku: find("sku"),
    retail: find("retail", "price"),
    url: find("aliexpress url", "aliexpress product url", "supplier product url", "supplier url"),
    query: find("search term", "search query"),
  };
}

function tokenize(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function buildQuery(title, presetQuery) {
  const base = presetQuery && presetQuery.trim() ? presetQuery : title;
  const tokens = tokenize(base).filter((t) => !BRAND_NOISE.has(t));
  return tokens.slice(0, 7).join(" ");
}

function slugifyQuery(q) {
  return q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim().replace(/\s+/g, "-");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
}
/** Extract candidate products from AliExpress search HTML. */
function parseSearchResults(html) {
  const out = new Map();
  const re = /"productId":"(\d+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const id = m[1];
    if (out.has(id)) continue;
    const window = html.slice(m.index, m.index + 3000);
    const rawTitle = window.match(/"displayTitle":"((?:[^"\\]|\\.)*)"/)?.[1] ?? "";
    if (!rawTitle) continue;
    const salePrice = window.match(/"salePrice":\{[^{}]*?"minPrice":([0-9.]+)/);
    const origPrice = window.match(/"originalPrice":\{[^{}]*?"minPrice":([0-9.]+)/);
    const currency = window.match(/"salePrice":\{[^{}]*?"currencyCode":"([A-Z]+)"/)?.[1] ?? "";
    const soldDesc = window.match(/"tradeDesc":"([^"]*)"/)?.[1] ?? "";
    const rating = window.match(/"starRating":([0-9.]+)/)?.[1] ?? "";
    const title = rawTitle
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\"/g, '"');
    out.set(id, {
      productId: id,
      url: `https://www.aliexpress.com/item/${id}.html`,
      title,
      price: salePrice ? Number(salePrice[1]) : origPrice ? Number(origPrice[1]) : null,
      originalPrice: origPrice ? Number(origPrice[1]) : null,
      currency,
      soldDesc,
      rating: rating ? Number(rating) : null,
    });
  }
  return [...out.values()];
}

function scoreCandidate(candidate, queryTokens, profile) {
  const candTokens = new Set(tokenize(candidate.title));
  if (candTokens.size === 0) return 0;
  // Hard reject for cross-gender matches (poisons DSers mappings).
  for (const bad of profile.reject) {
    if (candTokens.has(bad)) return 0;
  }
  let hits = 0;
  for (const t of queryTokens) if (candTokens.has(t)) hits++;
  const overlap = hits / queryTokens.length;
  const soldMatch = candidate.soldDesc.match(/([\d.,]+)\s*sold/);
  const sold = soldMatch ? Number(soldMatch[1].replace(/[.,]/g, "")) : 0;
  const soldBonus = Math.min(0.1, Math.log10(Math.max(1, sold)) / 30);
  const ratingBonus = candidate.rating ? Math.min(0.05, candidate.rating / 100) : 0;
  return Number((overlap + soldBonus + ratingBonus).toFixed(4));
}

function confidenceLabel(score) {
  if (score >= 0.6) return "HIGH";
  if (score >= 0.4) return "MEDIUM";
  if (score >= 0.2) return "LOW";
  return "VERY-LOW";
}
const OUTPUT_HEADER = [
  "STORE PRODUCT ID", "STORE PRODUCT NAME", "STORE PRODUCT HANDLE", "SKU",
  "RETAIL (AUD)", "PREVIOUS SUPPLIER URL", "ACTION", "MATCH CONFIDENCE",
  "MATCH SCORE", "SUPPLIER PRODUCT ID", "SUPPLIER PRODUCT NAME",
  "SUPPLIER PRODUCT URL", "SUPPLIER PRICE", "SUPPLIER CURRENCY",
  "SUPPLIER UNITS SOLD", "SEARCH QUERY",
];

async function main() {
  const args = parseArgs(process.argv);
  const csvPath = args.csv;
  const profile = PROFILES[args.profile ?? "generic"];
  const outPath = args.out ?? csvPath.replace(/\.csv$/i, "-resolved.csv");
  const jsonPath = args.json;
  const cacheDir = args.cache ?? ".sourcing-cache";
  const restrictPath = args.restrict ?? null;
  const limit = args.limit ? Number(args.limit) : Infinity;
  const delayMin = Number(args["delay-min"] ?? 1200);
  const delayMax = Number(args["delay-max"] ?? 2600);

  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error("Input CSV not found:", csvPath);
    process.exit(1);
  }
  fs.mkdirSync(cacheDir, { recursive: true });

  let restrictHandles = null;
  if (restrictPath && fs.existsSync(restrictPath)) {
    const restrictRows = parseCsv(fs.readFileSync(restrictPath, "utf8"));
    const hIdx = restrictRows[0].findIndex((h) => h.toLowerCase().includes("handle"));
    restrictHandles = new Set(restrictRows.slice(1).map((r) => r[hIdx]));
    console.log(`Restricting to ${restrictHandles.size} handles from ${restrictPath}`);
  }

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const col = detectColumns(rows[0]);
  const data = rows.slice(1).map((r) => ({
    id: col.id >= 0 ? r[col.id] : "",
    title: col.title >= 0 ? r[col.title] : "",
    handle: col.handle >= 0 ? r[col.handle] : "",
    sku: col.sku >= 0 ? r[col.sku] : "",
    retail: col.retail >= 0 ? r[col.retail] : "",
    existingUrl: col.url >= 0 ? r[col.url] : "",
    presetQuery: col.query >= 0 ? r[col.query] : "",
  }));

  const results = [];
  let done = 0, replaced = 0, kept = 0, fresh = 0, retained = 0, unresolved = 0;
  for (const row of data) {
    if (restrictHandles && !restrictHandles.has(row.handle)) continue;
    if (done >= limit) break;
    done++;
    const cacheKey = path.join(cacheDir, `${row.handle || row.id || done}.json`);
    // Title is the primary query source (preset search terms may carry noise).
    let query = buildQuery(row.title, "") || buildQuery("", row.presetQuery);
    let candidates = null;
    if (fs.existsSync(cacheKey)) {
      const cached = JSON.parse(fs.readFileSync(cacheKey, "utf8"));
      query = cached.query ?? query;
      candidates = cached.candidates ?? [];
    } else {
      if (!query) {
        results.push({ ...row, action: "UNRESOLVED", reason: "no query", supplier: null, score: 0, confidence: "NONE", searchQuery: "" });
        unresolved++;
        continue;
      }
      const searchUrl = `https://www.aliexpress.com/w/wholesale-${slugifyQuery(query)}.html`;
      try {
        const html = await fetchWithRetry(searchUrl);
        candidates = parseSearchResults(html);
      } catch (err) {
        console.error(`  x ${row.handle}: search failed (${err.message})`);
        candidates = [];
      }
      fs.writeFileSync(cacheKey, JSON.stringify({ query, searchUrl, candidates }, null, 2));
      await sleep(delayMin + Math.random() * (delayMax - delayMin));
    }

    const queryTokens = tokenize(query);
    let best = null, bestScore = 0;
    for (const c of candidates) {
      const s = scoreCandidate(c, queryTokens, profile);
      if (s > bestScore) { bestScore = s; best = c; }
    }

    const r = {
      storeId: row.id, storeName: row.title, storeHandle: row.handle, sku: row.sku,
      retail: row.retail, previousUrl: row.existingUrl, searchQuery: query,
      candidatesCount: candidates.length,
    };
    if (!best) {
      Object.assign(r, { action: row.existingUrl ? "RETAINED-SEARCH-FAILED" : "UNRESOLVED", confidence: "NONE", score: 0, supplier: null });
      unresolved++;
    } else if (row.existingUrl && row.existingUrl === best.url) {
      Object.assign(r, { action: "KEPT", confidence: confidenceLabel(bestScore), score: bestScore, supplier: best });
      kept++;
    } else if (row.existingUrl && bestScore < 0.4) {
      Object.assign(r, {
        action: "RETAINED-LOW-CONFIDENCE", confidence: confidenceLabel(bestScore), score: bestScore,
        supplier: { ...best, url: row.existingUrl, note: "kept previous URL; fresh match below confidence threshold" },
      });
      retained++;
    } else if (row.existingUrl) {
      Object.assign(r, { action: "REPLACED", confidence: confidenceLabel(bestScore), score: bestScore, supplier: best });
      replaced++;
    } else {
      Object.assign(r, { action: "NEW", confidence: confidenceLabel(bestScore), score: bestScore, supplier: best });
      fresh++;
    }
    results.push(r);
    console.log(`  ${r.action.padEnd(24)} ${r.storeHandle} -> ${r.supplier?.url ?? "(none)"} [${r.confidence} ${r.score}]`);
  }

  const lines = [OUTPUT_HEADER.join(",")];
  for (const r of results) {
    lines.push([
      r.storeId, r.storeName, r.storeHandle, r.sku, r.retail, r.previousUrl,
      r.action, r.confidence, r.score, r.supplier?.productId ?? "", r.supplier?.title ?? "",
      r.supplier?.url ?? "", r.supplier?.price ?? "", r.supplier?.currency ?? "",
      r.supplier?.soldDesc ?? "", r.searchQuery,
    ].map(csvEscape).join(","));
  }
  fs.writeFileSync(outPath, lines.join("\r\n") + "\r\n");
  if (jsonPath) {
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  }
  console.log(`\nDone: ${done} products | KEPT ${kept} | REPLACED ${replaced} | NEW ${fresh} | RETAINED ${retained} | UNRESOLVED ${unresolved}`);
  console.log(`CSV -> ${outPath}`);
  if (jsonPath) console.log(`JSON -> ${jsonPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });



