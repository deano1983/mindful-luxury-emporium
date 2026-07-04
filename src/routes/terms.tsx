import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Yu+Mi · A.D.H.D" },
      { name: "description", content: "The terms that govern your use of the Yu+Mi · A.D.H.D store, including orders, shipping, returns, and warranties." },
      { property: "og:title", content: "Terms & Conditions — Yu+Mi · A.D.H.D" },
      { property: "og:description", content: "Store terms covering orders, shipping, returns, warranties, and acceptable use." },
      { property: "og:url", content: "https://mindful-luxury-emporium.lovable.app/terms" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mindful-luxury-emporium.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const updated = "July 4, 2026";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {updated}</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-muted-foreground">
          <p className="italic border-l-2 border-primary/60 pl-4">
            These Terms are maintained by Yu+Mi · A.D.H.D and govern your use of our website and purchases from our store. Please read them carefully. Continuing to browse or place an order means you agree to them.
          </p>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">1. About us</h2>
            <p>Yu+Mi · A.D.H.D ("we", "us", "our") operates an online store curating luxury menswear, accessories, personal electronics, bedding, and tactile objects. Contact: <a href="mailto:concierge@yumiadhd.co" className="text-primary hover:underline">concierge@yumiadhd.co</a>.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old (or the legal age of majority where you live) to place an order. By checking out, you confirm you meet this requirement and that the information you provide is accurate.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">3. Orders &amp; pricing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices are shown in the currency indicated at checkout and may change without notice.</li>
              <li>An order confirmation email is an acknowledgement of receipt, not acceptance. We reserve the right to decline or cancel orders (e.g. suspected fraud, stock errors, obvious pricing mistakes).</li>
              <li>Applicable taxes and duties are your responsibility unless stated otherwise at checkout.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">4. Payment</h2>
            <p>Payments are processed by our third-party payment providers. By submitting payment information you authorize us and our providers to charge the total amount shown at checkout.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">5. Shipping &amp; delivery</h2>
            <p>Estimated shipping times are provided in good faith and are not guaranteed. Risk of loss and title for items pass to you upon delivery to the carrier. Please inspect your order on arrival and contact us within 7 days about any damage in transit.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">6. Returns &amp; refunds</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Unworn, unwashed items in original packaging may be returned within 14 days of delivery.</li>
              <li>Bedding, intimate objects, and personal electronics that have been opened are non-returnable for hygiene and safety reasons unless faulty.</li>
              <li>Refunds are issued to the original payment method within 5–10 business days of receipt of the returned item.</li>
              <li>Sale and final-clearance items are non-refundable unless required by law.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">7. Product descriptions</h2>
            <p>We work hard to represent every product accurately. Colours and finishes may vary between screens and real life. Where an item is a high-end replica or homage, this is noted in the product title or description.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">8. Intellectual property</h2>
            <p>All content on this site — including text, photography, logos, and design — is owned by or licensed to Yu+Mi · A.D.H.D and protected by intellectual-property laws. You may not copy, reproduce, or use it for commercial purposes without our written permission.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">9. Acceptable use</h2>
            <p>You agree not to misuse the site — including scraping, reverse-engineering, uploading malicious code, or interfering with other shoppers. We may suspend or terminate access for violations.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">10. Disclaimers</h2>
            <p>The site and products are provided "as is". To the fullest extent permitted by law, we disclaim implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Nothing here limits any rights you have under mandatory consumer-protection laws in your jurisdiction.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">11. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, our aggregate liability for any claim arising out of or relating to your use of the site or a purchase is limited to the amount you paid for the item(s) that gave rise to the claim.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">12. Governing law</h2>
            <p>These Terms are governed by the laws of the jurisdiction in which Yu+Mi · A.D.H.D is established, without regard to conflict-of-laws principles. Disputes will be resolved in the competent courts of that jurisdiction, unless applicable consumer law grants you additional forum rights.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">13. Changes</h2>
            <p>We may update these Terms from time to time. Continued use of the site after changes take effect constitutes acceptance of the updated Terms.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground mb-3">14. Contact</h2>
            <p>Yu+Mi · A.D.H.D — <a href="mailto:concierge@yumiadhd.co" className="text-primary hover:underline">concierge@yumiadhd.co</a></p>
          </div>

          <p className="pt-6 text-xs">See also our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}