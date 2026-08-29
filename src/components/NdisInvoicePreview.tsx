import { Button } from "@/components/ui/button";
import { Check, Download, Mail, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  NDIS_CONFIG,
  downloadInvoiceHtml,
  formatMoney,
  gstComponent,
  invoiceTotal,
  merchantMailto,
  openInvoicePrint,
  planManagerMailto,
  type NdisOrderSnapshot,
} from "@/lib/ndis";

export function NdisInvoicePreview({ snapshot, onDone }: { snapshot: NdisOrderSnapshot; onDone?: () => void }) {
  const total = invoiceTotal(snapshot.lines);
  const gst = gstComponent(total);
  const money = (n: number) => formatMoney(n, snapshot.currency);

  return (
    <div className="space-y-3">
      <div className="border hairline rounded-sm p-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-display text-sm gold-grad">Tax Invoice</span>
          <span className="text-muted-foreground">{snapshot.invoiceNumber}</span>
        </div>
        <p className="text-muted-foreground">{snapshot.brand} · ABN {NDIS_CONFIG.abn}</p>
        <p className="text-muted-foreground">
          Issued {new Date(snapshot.issuedAt).toLocaleDateString("en-AU")} ·{" "}
          {snapshot.flow === "card"
            ? "Paid by card — keep this for your NDIS claim"
            : `Payable within ${NDIS_CONFIG.paymentTermsDays} days`}
        </p>
        <div className="pt-2 border-t hairline space-y-1">
          {snapshot.lines.map((l, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate">{l.quantity} × {l.description}</span>
              <span className="flex-shrink-0">{money(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1 border-t hairline font-medium">
            <span>Total (GST incl.)</span>
            <span>{money(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GST component (included)</span>
            <span>{money(gst)}</span>
          </div>
        </div>
        <p className="pt-2 text-muted-foreground">
          Participant: {snapshot.details.participantName}
          {snapshot.details.ndisNumber ? ` · NDIS ${snapshot.details.ndisNumber}` : ""}
        </p>
        {snapshot.flow === "invoice" && snapshot.details.planManagerEmail && (
          <p className="text-muted-foreground">Bill to plan manager: {snapshot.details.planManagerName}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="rounded-sm text-xs h-9"
          onClick={() => { if (!openInvoicePrint(snapshot)) toast.error("Pop-up blocked — use Download instead."); }}
        >
          <Printer className="h-3.5 w-3.5 mr-1.5" />Print / PDF
        </Button>
        <Button variant="outline" className="rounded-sm text-xs h-9" onClick={() => downloadInvoiceHtml(snapshot)}>
          <Download className="h-3.5 w-3.5 mr-1.5" />Download
        </Button>
        {snapshot.flow === "invoice" && (
          <Button
            variant="outline"
            className="rounded-sm text-xs h-9 col-span-2"
            onClick={() => { window.location.href = planManagerMailto(snapshot); }}
          >
            <Mail className="h-3.5 w-3.5 mr-1.5" />Email invoice to plan manager
          </Button>
        )}
        <Button
          variant="outline"
          className="rounded-sm text-xs h-9 col-span-2"
          onClick={() => { window.location.href = merchantMailto(snapshot); }}
        >
          <Mail className="h-3.5 w-3.5 mr-1.5" />Send us a copy
        </Button>
      </div>
      {onDone && (
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm" onClick={onDone}>
          <Check className="h-4 w-4 mr-2" />Done
        </Button>
      )}
    </div>
  );
}

