import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { CATEGORIES } from "@/lib/shopify";
import rawCatalog from "@/data/catalog.json";

const BASE_URL = process.env.PUBLIC_BASE_URL ?? "https://yumi-luxury.netlify.app";

// STANDALONE: handles come from the bundled local catalog (no Shopify API).
async function fetchHandles(): Promise<string[]> {
  const catalog = rawCatalog as Array<{ node: { handle: string } }>;
  return catalog.map((e) => e.node.handle);
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