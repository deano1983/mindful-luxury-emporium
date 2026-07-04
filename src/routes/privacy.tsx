import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Yu+Mi · A.D.H.D" },
      { name: "description", content: "How Yu+Mi · A.D.H.D collects, uses, and safeguards your personal information when you shop our curated luxury collection." },
      { property: "og:title", content: "Privacy Policy — Yu+Mi · A.D.H.D" },
      { property: "og:description", content: "How Yu+Mi · A.D.H.D collects, uses, and safeguards your personal information." },
      { property: "og:url", content: "https://mindful-luxury-emporium.lovable.app/privacy" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mindful-luxury-emporium.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "July 4, 2026";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {updated}</p>

        <div className="prose-invert space-y-8 text-[15px] leading-relaxed text-muted-foreground">
          <p className="italic border-l-2 border-primary/60 pl-4">
            This page is maintained by Yu+Mi · A.D.H.D ("we", "us", "our") to explain how we handle your personal information. It is provided for transparency and is not a substitute for legal advice. Review with counsel before relying on it commercially.
          </p>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">1. Who we are</h2>
            <p>Yu+Mi · A.D.H.D is an online retailer of curated menswear, accessories, personal electronics, bedding, and tactile objects designed for sensory-sensitive shoppers. Questions about this policy can be sent to <a href="mailto:concierge@yumiadhd.co" className="text-primary hover:underline">concierge@yumiadhd.co</a>.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="text-foreground">Order &amp; account details</span> — name, shipping/billing address, email, phone number, and order history.</li>
              <li><span className="text-foreground">Payment information</span> — processed by our payment providers; we do not store full card numbers on our servers.</li>
              <li><span className="text-foreground">Device &amp; usage data</span> — IP address, browser type, pages viewed, referral source, and cart activity, collected via cookies and similar technologies.</li>
              <li><span className="text-foreground">Communications</span> — messages you send to customer support and newsletter preferences.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process orders, payments, shipping, returns, and warranty requests.</li>
              <li>Provide customer support and respond to your inquiries.</li>
              <li>Send transactional emails and — with your consent — marketing communications you can unsubscribe from at any time.</li>
              <li>Detect fraud, protect our platform, and comply with legal obligations.</li>
              <li>Improve our site, product mix, and shopping experience.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">4. Third-party services</h2>
            <p>We rely on trusted providers to run the store. Categories include:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>E-commerce &amp; checkout platform (Shopify)</li>
              <li>Payment processors (e.g. Shop Pay, credit card networks)</li>
              <li>Shipping and fulfillment partners</li>
              <li>Email delivery and customer support tooling</li>
              <li>Analytics and hosting infrastructure</li>
            </ul>
            <p className="mt-3">Each provider processes data under its own terms and only for the purposes described here.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">5. Cookies</h2>
            <p>We use strictly-necessary cookies to keep you signed in and your cart intact, and optional cookies for analytics and marketing. You can adjust cookie preferences through your browser settings.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">6. Data retention</h2>
            <p>We retain order and account information for as long as your account is active and thereafter as required to comply with tax, accounting, and legal obligations.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">7. Your rights</h2>
            <p>Depending on where you live, you may have rights to access, correct, delete, or port your personal information, and to object to or restrict certain processing. Email <a href="mailto:concierge@yumiadhd.co" className="text-primary hover:underline">concierge@yumiadhd.co</a> to exercise any of these rights. Residents of the EEA, UK, California, and other regulated jurisdictions have additional rights under local law.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">8. Security</h2>
            <p>We use reasonable administrative, technical, and physical safeguards intended to protect your information. No online service can guarantee absolute security; please use a strong password and keep it confidential.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">9. Children</h2>
            <p>Our store is intended for adults. We do not knowingly collect information from anyone under 16.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">10. Changes to this policy</h2>
            <p>We may update this policy from time to time. When we do, we will revise the "Last updated" date above and, where appropriate, notify you by email or in-store.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">11. Contact</h2>
            <p>Yu+Mi · A.D.H.D — <a href="mailto:concierge@yumiadhd.co" className="text-primary hover:underline">concierge@yumiadhd.co</a></p>
          </div>

          <p className="pt-6 text-xs">See also our <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}