// NDIS (National Disability Insurance Scheme) invoicing for Yu+Mi · A.D.H.D Sanctuary.
// Two checkout flows are supported:
//   "card"    — participant pays by card as usual; an NDIS-ready tax invoice is issued
//               so self-managed participants can claim reimbursement from the NDIA.
//   "invoice" — plan-managed participants: no card payment here. A tax invoice is
//               created for their plan manager; goods ship once the invoice is paid.
// Client-only-safe: runs on the web deploy and inside the Capacitor app WebView.

export const NDIS_CONFIG = {
  brandName: "Yu+Mi · A.D.H.D Sanctuary",
  abn: "61 794 639 443",
  acn: "72 448 917",
  contactEmail: "concierge@yumiadhd.co",
  currency: "AUD",
  invoicePrefix: "YMA",
  gstRate: 0.1,
  paymentTermsDays: 14,
  bankDetails: "Commonwealth Bank · BSB 062-948 · Account 72448917",
};

export type NdisFlow = "card" | "invoice";

export interface NdisDetails {
  participantName: string;
  ndisNumber: string;
  abn: string;
  email: string;
  phone: string;
  planManagerName: string;
  planManagerEmail: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface NdisOrderSnapshot {
  brand: string;
  invoiceNumber: string;
  issuedAt: string; // ISO date
  currency: string;
  flow: NdisFlow;
  lines: InvoiceLine[];
  details: NdisDetails;
}

const SNAPSHOT_KEY = "yumi-ndis-order";

export const emptyNdisDetails = (): NdisDetails => ({
  participantName: "",
  ndisNumber: "",
  abn: "",
  email: "",
  phone: "",
  planManagerName: "",
  planManagerEmail: "",
});

export function newInvoiceNumber(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${NDIS_CONFIG.invoicePrefix}-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function invoiceTotal(lines: InvoiceLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function gstComponent(total: number): number {
  return total - total / (1 + NDIS_CONFIG.gstRate);
}

export function formatMoney(amount: number, currency: string = NDIS_CONFIG.currency): string {
  return `${currency} ${amount.toFixed(2)}`;
}

export function saveSnapshot(snapshot: NdisOrderSnapshot): void {
  try { window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot)); } catch { /* private mode */ }
}

export function loadSnapshot(): NdisOrderSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as NdisOrderSnapshot) : null;
  } catch { return null; }
}

export function clearSnapshot(): void {
  try { window.localStorage.removeItem(SNAPSHOT_KEY); } catch { /* noop */ }
}

export function snapshotToText(s: NdisOrderSnapshot): string {
  const items = s.lines.map(l => `  · ${l.description} — ${l.quantity} × ${formatMoney(l.unitPrice, s.currency)}`).join("\n");
  const total = invoiceTotal(s.lines);
  const gst = gstComponent(total);
  return [
    `TAX INVOICE ${s.invoiceNumber} — ${s.brand}`,
    `Issued: ${new Date(s.issuedAt).toLocaleDateString("en-AU")}`,
    `ABN: ${NDIS_CONFIG.abn} (ACN ${NDIS_CONFIG.acn})`,
    `Contact: ${NDIS_CONFIG.contactEmail}`,
    "",
    `Participant: ${s.details.participantName}`,
    s.details.ndisNumber ? `NDIS number: ${s.details.ndisNumber}` : "",
    s.details.email ? `Email: ${s.details.email}` : "",
    s.details.planManagerName ? `Plan manager: ${s.details.planManagerName} <${s.details.planManagerEmail}>` : "",
    "",
    "Items:",
    items,
    "",
    `Total (GST inclusive): ${formatMoney(total, s.currency)}`,
    `GST component: ${formatMoney(gst, s.currency)}`,
    "",
    s.flow === "invoice"
      ? `Payment terms: ${NDIS_CONFIG.paymentTermsDays} days from invoice date. ${NDIS_CONFIG.bankDetails}. Goods ship once payment is received.`
      : "Paid by card at checkout. Keep this invoice for your NDIS reimbursement claim.",
    "",
    `${s.brand} is not a registered NDIS provider. This invoice is provided so self-managed and plan-managed participants can claim under their plan.`,
  ].filter(Boolean).join("\n");
}

function mailto(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function planManagerMailto(s: NdisOrderSnapshot): string {
  return mailto(
    s.details.planManagerEmail,
    `NDIS invoice ${s.invoiceNumber} for ${s.details.participantName}`,
    `Hello ${s.details.planManagerName},\n\nPlease process this invoice from my NDIS plan:\n\n${snapshotToText(s)}\n\nThank you,\n${s.details.participantName}`,
  );
}

export function merchantMailto(s: NdisOrderSnapshot): string {
  return mailto(
    NDIS_CONFIG.contactEmail,
    `NDIS order ${s.invoiceNumber} (${s.flow === "invoice" ? "pay by invoice" : "card + tax invoice"})`,
    `A customer completed the NDIS ${s.flow === "invoice" ? "pay-by-invoice" : "card + tax invoice"} flow:\n\n${snapshotToText(s)}`,
  );
}

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

export function buildInvoiceHtmlDoc(s: NdisOrderSnapshot): string {
  const cfg = NDIS_CONFIG;
  const total = invoiceTotal(s.lines);
  const gst = gstComponent(total);
  const money = (n: number) => formatMoney(n, s.currency);
  const rows = s.lines
    .map(l => `<tr><td>${escapeHtml(l.description)}</td><td class="n">${l.quantity}</td><td class="n">${escapeHtml(money(l.unitPrice))}</td><td class="n">${escapeHtml(money(l.unitPrice * l.quantity))}</td></tr>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Tax invoice ${escapeHtml(s.invoiceNumber)}</title>
<style>
body{font:13px/1.5 Georgia,serif;color:#1a1a1a;max-width:760px;margin:32px auto;padding:0 16px}
h1{font-size:26px;letter-spacing:.06em;margin:0}
h2{font-size:18px;letter-spacing:.2em;margin:16px 0 4px}
.muted{color:#777}
.grid{display:flex;justify-content:space-between;gap:24px;margin:20px 0}
table{width:100%;border-collapse:collapse;margin:12px 0}
th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}
.n{text-align:right}
tfoot td{border:none;font-weight:bold}
.box{border:1px solid #ddd;padding:12px;min-width:0}
.terms{margin-top:24px;font-size:12px;color:#555}
</style></head><body>
<h1>${escapeHtml(s.brand)}</h1>
<p class="muted">ABN: ${escapeHtml(cfg.abn)} · ACN ${escapeHtml(cfg.acn)} · ${escapeHtml(cfg.contactEmail)}</p>
<h2>TAX INVOICE</h2>
<div class="grid">
<div class="box"><strong>Bill to</strong><br>${escapeHtml(s.details.participantName)}<br>
${s.details.ndisNumber ? `NDIS: ${escapeHtml(s.details.ndisNumber)}<br>` : ""}
${escapeHtml(s.details.email)}
${s.details.planManagerName ? `<br>Plan manager: ${escapeHtml(s.details.planManagerName)} (${escapeHtml(s.details.planManagerEmail)})` : ""}</div>
<div class="box"><strong>Invoice</strong><br>No: ${escapeHtml(s.invoiceNumber)}<br>Date: ${new Date(s.issuedAt).toLocaleDateString("en-AU")}
<br>${s.flow === "invoice" ? `Terms: ${cfg.paymentTermsDays} days` : "Status: paid by card"}</div>
</div>
<table><thead><tr><th>Description</th><th class="n">Qty</th><th class="n">Unit</th><th class="n">Amount</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot>
<tr><td colspan="3" class="n">Total (${escapeHtml(s.currency)}, GST inclusive)</td><td class="n">${escapeHtml(money(total))}</td></tr>
<tr><td colspan="3" class="n">GST component (rate ${Math.round(cfg.gstRate * 100)}%, included)</td><td class="n">${escapeHtml(money(gst))}</td></tr>
</tfoot></table>
${s.flow === "invoice"
  ? `<p><strong>Payment:</strong> ${escapeHtml(cfg.bankDetails)} — within ${cfg.paymentTermsDays} days. Goods ship once payment is received.</p>`
  : `<p>Paid by card at checkout — keep this invoice for your NDIS reimbursement claim.</p>`}
<p class="terms">${escapeHtml(s.brand)} is not a registered NDIS provider. This tax invoice is provided so self-managed and plan-managed participants can claim under their plan; eligibility is determined by the NDIA or your plan manager.</p>
</body></html>`;
}

export function openInvoicePrint(s: NdisOrderSnapshot): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(buildInvoiceHtmlDoc(s));
  w.document.close();
  w.focus();
  w.print();
  return true;
}

export function downloadInvoiceHtml(s: NdisOrderSnapshot): void {
  const blob = new Blob([buildInvoiceHtmlDoc(s)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${s.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}


