import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { CATEGORIES, PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find(c => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.cat.title} — Yu+Mi · A.D.H.D` },
      { name: "description", content: loaderData.cat.blurb },
      { property: "og:title", content: `${loaderData.cat.title} — Yu+Mi · A.D.H.D` },
      { property: "og:description", content: loaderData.cat.blurb },
      { property: "og:url", content: `https://mindful-luxury-emporium.lovable.app/category/${loaderData.cat.slug}` },
    ] : [],
    links: loaderData ? [{ rel: "canonical", href: `https://mindful-luxury-emporium.lovable.app/category/${loaderData.cat.slug}` }] : [],
    scripts: loaderData ? [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${loaderData.cat.title} — Yu+Mi · A.D.H.D`,
        description: loaderData.cat.blurb,
        url: `https://mindful-luxury-emporium.lovable.app/category/${loaderData.cat.slug}`,
      }),
    }] : [],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Category not found.</p></div>
  ),
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const { data, isLoading } = useQuery({
    queryKey: ["products", cat.tag],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: `tag:${cat.tag}` });
      return (res?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 border-b hairline">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">House of</p>
        <h1 className="font-display text-5xl md:text-6xl">{cat.title}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{cat.blurb}</p>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        {isLoading ? <p className="text-muted-foreground">Loading…</p> : <ProductGrid products={data ?? []} />}
      </section>
      <Footer />
    </div>
  );
}
