import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { CATEGORIES, PRODUCTS_QUERY, SHOPIFY_STOREFRONT_URL, SHOPIFY_STOREFRONT_TOKEN } from "@/lib/shopify";

const BASE_URL = "https://mindful-luxury-emporium.lovable.app";

async function fetchHandles(): Promise<string[]> {
  try {
    const res = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 250, query: "" } }),
    });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { products?: { edges?: Array<{ node: { handle: string } }> } } };
    return (json.data?.products?.edges ?? []).map(e => e.node.handle);
  } catch { return []; }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const handles = await fetchHandles();
        const paths: Array<{ path: string; priority?: string; changefreq?: string }> = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          ...CATEGORIES.map(c => ({ path: `/category/${c.slug}`, changefreq: "weekly", priority: "0.8" })),
          ...handles.map(h => ({ path: `/product/${h}`, changefreq: "weekly", priority: "0.6" })),
        ];
        const urls = paths.map(e =>
          `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});