import rawCatalog from "@/data/catalog.json";

/**
 * STANDALONE CATALOG (Yu+Mi) — no Shopify, no Lovable.
 * The storefront no longer calls the Shopify Storefront API (which began
 * returning HTTP 402). All product data ships with the app from
 * src/data/catalog.json (built from store/yumi-shopify-products-raw.json).
 *
 * storefrontApiRequest() is kept as a compatibility shim with the same
 * response shapes the routes already parse, so no route logic changes.
 */

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    tags: string[];
    vendor?: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

const CATALOG = rawCatalog as unknown as ShopifyProduct[];

export const PRODUCTS_QUERY = "local:products";
export const PRODUCT_BY_HANDLE_QUERY = "local:product-by-handle";

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  if (query === PRODUCT_BY_HANDLE_QUERY) {
    const product = CATALOG.find((p) => p.node.handle === variables.handle)?.node ?? null;
    return { data: { product } };
  }
  // products(first, query) — query uses Shopify tag syntax `tag:<tag>`; fall back to all.
  const tag = typeof variables.query === "string" ? variables.query.match(/^tag:(.+)$/)?.[1] : null;
  const edges = tag ? CATALOG.filter((p) => p.node.tags.includes(tag)) : CATALOG;
  return { data: { products: { edges } } };
}
export const CATEGORIES = [
  { slug: "fashion", title: "Fashion", tag: "fashion", blurb: "Tactile-considered luxury menswear designed for comfort, calm and sensory regulation — soft hands, flat seams, quiet drape." },
  { slug: "accessories", title: "Fashion Accessories", tag: "accessories", blurb: "Quiet statements heavy on craft: iced moissanite jewellery and designer-grade eyewear that finish the look without the noise." },
  { slug: "electronics", title: "Personal Electronics", tag: "electronics", blurb: "Stimulus-shaping audio, wearables and devices for focus, deep work and decompression — chosen for low-friction daily use." },
  { slug: "bedding", title: "Bedding & Sanctuary", tag: "bedding", blurb: "Weighted, soft and deeply regulating bedding curated to lower nervous-system load and turn the bedroom into a true sanctuary." },
  { slug: "objects", title: "Objects & Play", tag: "objects", blurb: "Fidget, focus and finely-made play objects — discreet, professional-grade tools for sensory regulation and everyday creative flow." },
] as const;

