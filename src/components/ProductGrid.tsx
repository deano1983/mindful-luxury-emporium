import { ProductCard } from "./ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductGrid({ products }: { products: ShopifyProduct[] }) {
  if (!products.length) {
    return (
      <div className="text-center py-24 border hairline">
        <p className="font-display text-2xl text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground mt-2">Tell the assistant what to add to begin curating.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      {products.map(p => <ProductCard key={p.node.id} product={p} />)}
    </div>
  );
}
