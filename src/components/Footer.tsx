import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t hairline mt-32">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10 text-sm">
        <div>
          <p className="font-display text-2xl gold-grad mb-2">Yu+Mi · A.D.H.D</p>
          <p className="text-muted-foreground max-w-xs">A sanctuary of luxury objects engineered to soften the noise of the world.</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">Sourcing</p>
          <p className="text-muted-foreground">Curated globally via AliTrade and Made-in-China partners. Vetted for craft, tactility, and stimulus design.</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">Contact</p>
          <p className="text-muted-foreground">concierge@yumiadhd.co</p>
          <div className="mt-4 flex gap-4 text-xs">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
      <div className="border-t hairline py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Yu+Mi · A.D.H.D · All rights reserved.</div>
    </footer>
  );
}
