import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS_QUERY, storefrontApiRequest, CATEGORIES, type ShopifyProduct } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import catBedding from "@/assets/cat-bedding.jpg";
import catMisc from "@/assets/cat-misc.jpg";

const CAT_IMAGES: Record<string, string> = {
  fashion: catFashion, accessories: catAccessories, electronics: catElectronics, bedding: catBedding, objects: catMisc,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yu+Mi · A.D.H.D — Luxury for the sensitive mind" },
      { name: "description", content: "Curated luxury menswear, fashion accessories, personal electronics, weighted bedding, and high-end fidget objects — designed to soften external stimuli." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: null });
      return (res?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
  });
  const products = data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" width={1920} height={1280} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-40">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">Yu+Mi · A.D.H.D</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] max-w-3xl">
            Luxury for the <span className="gold-grad italic">sensitive</span> mind.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl">
            A curated sanctuary of menswear, electronics, and tactile objects — sourced globally, vetted for craft, engineered to soften the noise of the world.
          </p>
          <div className="mt-10 flex gap-4">
            <Button asChild size="lg" className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="#shop">Enter the collection</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm gold-border bg-transparent">
              <Link to="/category/$slug" params={{ slug: "bedding" }}>Sanctuary essentials</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="shop" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">The Five Houses</p>
            <h2 className="font-display text-4xl md:text-5xl">Shop by sense.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group relative aspect-[3/4] overflow-hidden block">
              <img src={CAT_IMAGES[c.slug]} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <h3 className="font-display text-xl md:text-2xl text-foreground">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">The Edit</p>
            <h2 className="font-display text-4xl md:text-5xl">New & noted.</h2>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-24 border hairline">
            <p className="font-display text-2xl text-muted-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground mt-2">The collection is being curated. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map(p => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Manifesto */}
      <section className="border-t hairline">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">Manifesto</p>
          <p className="font-display text-2xl md:text-3xl leading-relaxed">
            "We dress in cashmere because cotton scratches. We weight the blanket because the world is loud. We turn fidget into furniture-grade brass. Every object here has a second job: to soften something."
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
