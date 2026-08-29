import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, HeartHandshake, Info, ShieldCheck } from "lucide-react";
import { NdisInvoicePreview } from "@/components/NdisInvoicePreview";
import { clearSnapshot, loadSnapshot } from "@/lib/ndis";

export const Route = createFileRoute("/ndis")({
  head: () => ({
    meta: [
      { title: "NDIS & Invoice Payments — Yu+Mi · A.D.H.D" },
      { name: "description", content: "Yu+Mi · A.D.H.D supports NDIS participants — pay by card with a tax invoice for reimbursement, or pay by invoice through your plan manager." },
    ],
  }),
  component: NdisPage,
});

function NdisPage() {
  const [snapshot, setSnapshot] = useState(loadSnapshot);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4 flex items-center gap-2">
        <HeartHandshake className="h-4 w-4" /> NDIS participants welcome
      </p>
      <h1 className="font-display text-4xl md:text-5xl gold-grad mb-6">NDIS &amp; Invoice Payments</h1>
      <p className="text-muted-foreground mb-12 leading-relaxed">
        If you are an NDIS participant, we support two ways to buy — both produce a proper tax invoice for claiming.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="border hairline rounded-sm p-6 space-y-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h2 className="font-display text-xl">Pay by card, claim yourself</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For <strong>self-managed</strong> participants. Checkout with your card as usual — we attach your participant
            details to the order and issue an NDIS-ready tax invoice so you can claim reimbursement from the NDIA.
          </p>
          <p className="text-xs text-muted-foreground">Choose “Paying with NDIS funds?” in your basket to get started.</p>
        </div>
        <div className="border hairline rounded-sm p-6 space-y-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="font-display text-xl">Pay by NDIS invoice</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For <strong>plan-managed</strong> participants. No card needed — we generate a tax invoice for your plan
            manager. Email it to them from the basket, and we confirm and ship once the invoice is paid.
          </p>
          <p className="text-xs text-muted-foreground">Choose “Paying with NDIS funds?” in your basket to get started.</p>
        </div>
      </div>

      <div className="border hairline rounded-sm p-6 mb-12">
        <h2 className="font-display text-2xl gold-grad mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Your invoice
        </h2>
        {snapshot ? (
          <NdisInvoicePreview
            snapshot={snapshot}
            onDone={() => { clearSnapshot(); setSnapshot(null); }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No invoice generated yet. Start in your basket — tap “Paying with NDIS funds?” under the checkout button.
            Once created, your tax invoice is kept here so you can print, download or email it again.
          </p>
        )}
      </div>

      <div className="border hairline rounded-sm p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" /> Important — eligibility &amp; compliance
        </h3>
        <p>
          We are <strong>not a registered NDIS provider</strong>. That means self-managed and plan-managed participants
          can buy from us and claim with our tax invoices, but agency (NDIA)-managed participants cannot.
        </p>
        <p>
          NDIS only funds supports that are reasonable and necessary for your disability, as set out in your plan.
          Fashion and lifestyle purchases may not meet those criteria — please check with your plan manager, LAC or
          the NDIA before ordering. Responsibility for a claim always rests with the participant.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link to="/"><Button variant="outline" className="rounded-sm">Return Home</Button></Link>
      </div>
    </div>
  );
}

