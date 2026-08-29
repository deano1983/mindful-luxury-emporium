import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { NdisInvoicePreview } from "@/components/NdisInvoicePreview";
import {
  NDIS_CONFIG,
  emptyNdisDetails,
  newInvoiceNumber,
  saveSnapshot,
  type InvoiceLine,
  type NdisDetails,
  type NdisFlow,
  type NdisOrderSnapshot,
} from "@/lib/ndis";

type FieldId = keyof NdisDetails;

interface FieldDef {
  id: FieldId;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}

const CARD_FIELDS: FieldDef[] = [
  { id: "participantName", label: "Participant name", placeholder: "As it appears on your NDIS plan", required: true },
  { id: "ndisNumber", label: "NDIS number", placeholder: "Optional — helps your plan manager process the claim" },
  { id: "email", label: "Your email", placeholder: "you@example.com", type: "email", required: true },
];

const INVOICE_FIELDS: FieldDef[] = [
  ...CARD_FIELDS,
  { id: "planManagerName", label: "Plan manager name", placeholder: "Who manages your plan funds", required: true },
  { id: "planManagerEmail", label: "Plan manager email", placeholder: "invoices@yourplanmanager.com.au", type: "email", required: true },
];

export function NdisCheckout({
  lines,
  currency = NDIS_CONFIG.currency,
  onCardDetailsSaved,
}: {
  lines: InvoiceLine[];
  currency?: string;
  onCardDetailsSaved?: (details: NdisDetails) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<NdisFlow>("card");
  const [details, setDetails] = useState<NdisDetails>(emptyNdisDetails());
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<NdisOrderSnapshot | null>(null);

  const fields = flow === "card" ? CARD_FIELDS : INVOICE_FIELDS;

  const submit = async () => {
    if (!lines.length) { toast.error("Add something to your basket first."); return; }
    if (!details.participantName.trim()) { toast.error("Please enter the participant name."); return; }
    if (!details.email.trim() || !details.email.includes("@")) { toast.error("Please enter a valid email address."); return; }
    if (flow === "invoice" && (!details.planManagerName.trim() || !details.planManagerEmail.includes("@"))) {
      toast.error("Please enter your plan manager's name and email.");
      return;
    }
    setBusy(true);
    try {
      if (flow === "card" && onCardDetailsSaved) await onCardDetailsSaved(details);
      const snap: NdisOrderSnapshot = {
        brand: NDIS_CONFIG.brandName,
        invoiceNumber: newInvoiceNumber(),
        issuedAt: new Date().toISOString(),
        currency,
        flow,
        lines,
        details,
      };
      saveSnapshot(snap);
      setSnapshot(snap);
      toast.success(
        flow === "card"
          ? "NDIS details added to your order — continue to card checkout as normal."
          : "Invoice ready — email it to your plan manager below.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <HeartHandshake className="h-3.5 w-3.5" /> Paying with NDIS funds? <ChevronUp className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="border hairline rounded-sm p-4 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base gold-grad">
          <HeartHandshake className="h-4 w-4" /> NDIS &amp; invoice payment
        </p>
        <button onClick={() => { setOpen(false); setSnapshot(null); }} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Close NDIS section">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {snapshot ? (
        <>
          <p className="text-xs text-muted-foreground">
            {snapshot.flow === "card"
              ? "Your NDIS tax invoice is ready below. Pay by card as usual, then keep this invoice for your reimbursement claim."
              : "Email this invoice to your plan manager (and send us a copy). We confirm and ship once payment is received."}
          </p>
          <NdisInvoicePreview snapshot={snapshot} onDone={() => setOpen(false)} />
        </>
      ) : (
        <>
          <div className="grid gap-2">
            <button
              onClick={() => setFlow("card")}
              className={`text-left p-3 rounded-sm border hairline transition-colors ${flow === "card" ? "ring-1 ring-primary bg-primary/5" : "hover:bg-secondary"}`}
            >
              <strong className="block">Pay by card now</strong>
              <span className="text-xs text-muted-foreground">I claim from NDIS myself (self-managed). I get a tax invoice for my claim.</span>
            </button>
            <button
              onClick={() => setFlow("invoice")}
              className={`text-left p-3 rounded-sm border hairline transition-colors ${flow === "invoice" ? "ring-1 ring-primary bg-primary/5" : "hover:bg-secondary"}`}
            >
              <strong className="block">Pay by NDIS invoice</strong>
              <span className="text-xs text-muted-foreground">My plan manager pays (plan-managed). No card needed — goods ship once the invoice is paid.</span>
            </button>
          </div>

          <div className="grid gap-3">
            {fields.map(f => (
              <div key={f.id} className="grid gap-1.5">
                <Label htmlFor={`ndis-${f.id}`}>{f.label}{f.required ? " *" : ""}</Label>
                <Input
                  id={`ndis-${f.id}`}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={details[f.id]}
                  onChange={e => setDetails(d => ({ ...d, [f.id]: e.target.value }))}
                  className="rounded-sm"
                />
              </div>
            ))}
          </div>

          <Button onClick={submit} disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : flow === "card" ? "Save details & get my tax invoice" : "Create my NDIS invoice"}
          </Button>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            We are not a registered NDIS provider, so invoices suit self-managed and plan-managed participants only. Claims depend on your plan — read{" "}
            <Link to="/ndis" className="underline hover:text-primary transition-colors">how NDIS invoicing works</Link> before ordering.
          </p>
        </>
      )}
    </div>
  );
}

