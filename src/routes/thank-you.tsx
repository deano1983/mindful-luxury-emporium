import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank You — Yu+Mi" },
      { name: "description", content: "Your order is on its way." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const clearCart = useCartStore(s => s.clearCart);
  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-24 max-w-xl text-center">
      <div className="w-16 h-16 rounded-full border hairline flex items-center justify-center mx-auto mb-8">
        <Check className="h-7 w-7 text-primary" />
      </div>
      <h1 className="font-display text-4xl md:text-5xl gold-grad mb-4">Thank You</h1>
      <p className="text-muted-foreground mb-2">Your order has been received.</p>
      <p className="text-sm text-muted-foreground mb-12">
        A confirmation, with tracking once dispatched, is on its way to your inbox. Everything from here is calm — no follow-ups, no noise.
      </p>
      <Link to="/"><Button variant="outline" className="rounded-sm">Return Home</Button></Link>
    </div>
  );
}
