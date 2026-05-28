import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode || "AUD";

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) { window.open(url, "_blank"); setOpen(false); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary">
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full p-0 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card border-l hairline">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl gold-grad">Your Selection</SheetTitle>
          <SheetDescription>{totalItems === 0 ? "Nothing chosen yet." : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Your sanctuary awaits.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0 space-y-4">
                {items.map(item => (
                  <div key={item.variantId} className="flex gap-4 pb-4 border-b hairline">
                    <div className="w-20 h-20 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.product.node.title}</h4>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.selectedOptions.map(o => o.value).join(" · ")}</p>
                      )}
                      <p className="text-sm gold-grad font-medium mt-1">{currency} {parseFloat(item.price.amount).toFixed(2)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center text-xs">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 self-start" onClick={() => removeItem(item.variantId)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-4 border-t hairline">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-widest text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-display gold-grad">{currency} {totalPrice.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm" size="lg" disabled={isLoading || isSyncing}>
                  {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4 mr-2" />Proceed to Checkout</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
