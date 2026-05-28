import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";
import { CATEGORIES } from "@/lib/shopify";

export function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b hairline">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-xl gold-grad tracking-tight">Yu+Mi</span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">+ A.D.H.D</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {CATEGORIES.map(c => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="hover:text-primary transition-colors">
              {c.title}
            </Link>
          ))}
        </nav>
        <CartDrawer />
      </div>
    </header>
  );
}
