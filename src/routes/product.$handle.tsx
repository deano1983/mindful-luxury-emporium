import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    try {
      const res = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle: params.handle });
      return { product: res?.data?.product ?? null };
    } catch { return { product: null }; }
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.product;
    const readable = params.handle.replace(/-/g, " ");
    const title = p?.title ?? readable;
    const rawDesc = p?.description || `${readable} — sensory-considered luxury from Yu+Mi Sanctuary. Premium fabrics and quiet construction, with full sizing and detailed materials.`;
    const desc = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;
    const image = p?.images?.edges?.[0]?.node?.url;
    const price = p?.variants?.edges?.[0]?.node?.price;
    const available = p?.variants?.edges?.some((e: { node: { availableForSale: boolean } }) => e.node.availableForSale);
    const url = `https://mindful-luxury-emporium.lovable.app/product/${params.handle}`;
    return {
      meta: [
        { title: `${title} — Yu+Mi · A.D.H.D` },
        { name: "description", content: desc },
        { property: "og:title", content: `${title} — Yu+Mi · A.D.H.D` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: rawDesc,
          ...(image ? { image: [image] } : {}),
          url,
          ...(price ? {
            offers: {
              "@type": "Offer",
              price: parseFloat(price.amount).toFixed(2),
              priceCurrency: price.currencyCode,
              availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url,
            },
          } : {}),
        }),
      }] : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const initial = Route.useLoaderData();
  const { data, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return res?.data?.product;
    },
    initialData: initial?.product ?? undefined,
  });
  const addItem = useCartStore(s => s.addItem);
  const cartLoading = useCartStore(s => s.isLoading);
  const [variantIdx, setVariantIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  if (isLoading) {
    return <div className="min-h-screen bg-background"><Header /><div className="max-w-7xl mx-auto px-6 py-24 text-muted-foreground">Loading…</div></div>;
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="font-display text-2xl">Product not found.</p>
          <Link to="/" className="text-primary text-sm mt-3 inline-block">← Return to shop</Link>
        </div>
      </div>
    );
  }

  const variants = data.variants.edges.map((e: { node: { id: string; title: string; price: { amount: string; currencyCode: string }; availableForSale: boolean; selectedOptions: Array<{ name: string; value: string }> } }) => e.node);
  const variant = variants[variantIdx];
  const images = data.images.edges.map((e: { node: { url: string; altText: string | null } }) => e.node);
  const activeImg = images[imgIdx] ?? images[0];

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: { node: data },
      variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary uppercase tracking-[0.2em]">
          <ChevronLeft className="h-3 w-3 mr-1" /> Back
        </Link>
        <div className="grid lg:grid-cols-2 gap-12 mt-6">
          <div>
            <div className="aspect-square bg-secondary overflow-hidden">
              {activeImg ? (
                <img src={activeImg.url} alt={activeImg.altText ?? data.title} className="w-full h-full object-cover" />
              ) : <div className="w-full h-full surface-grain" />}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img: { url: string }, i: number) => (
                  <button key={i} onClick={() => setImgIdx(i)} aria-label={`View product image ${i + 1}`} className={`aspect-square w-20 flex-shrink-0 overflow-hidden border ${i === imgIdx ? "border-primary" : "hairline"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">{data.productType}</p>
            <h1 className="font-display text-4xl md:text-5xl">{data.title}</h1>
            <p className="mt-4 text-2xl gold-grad font-display">
              {variant?.price.currencyCode} {parseFloat(variant?.price.amount ?? "0").toFixed(2)}
            </p>
            <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{data.description}</p>

            {variants.length > 1 && (
              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: { id: string; title: string; availableForSale: boolean }, i: number) => (
                    <button key={v.id} onClick={() => setVariantIdx(i)} disabled={!v.availableForSale} className={`px-4 py-2 text-xs border rounded-sm transition ${i === variantIdx ? "border-primary text-primary" : "hairline text-muted-foreground hover:text-foreground"} ${!v.availableForSale ? "opacity-40" : ""}`}>
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleAdd} disabled={cartLoading || !variant?.availableForSale} size="lg" className="mt-10 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              {cartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : variant?.availableForSale ? "Add to Selection" : "Unavailable"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
