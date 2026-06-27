import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore(s => s.addItem);
  const isLoading = useCartStore(s => s.isLoading);
  const variant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <Link to="/product/$handle" params={{ handle: product.node.handle }} className="group block">
      <div className="aspect-[4/5] bg-secondary overflow-hidden mb-3 relative">
        {image ? (
          <img src={image.url} alt={image.altText ?? product.node.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full surface-grain" />
        )}
        <Button
          onClick={handleAdd}
          disabled={isLoading || !variant}
          size="icon"
          aria-label="Add to selection"
          className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-tight line-clamp-1">{product.node.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{product.node.productType}</p>
        <p className="text-sm gold-grad font-medium">{price.currencyCode} {parseFloat(price.amount).toFixed(2)}</p>
      </div>
    </Link>
  );
}
