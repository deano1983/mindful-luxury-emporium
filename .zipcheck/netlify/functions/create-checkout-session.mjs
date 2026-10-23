/**
 * Yu+Mi standalone checkout (Netlify Function, direct Stripe REST).
 * No Lovable gateway, no Shopify. Prices validated server-side from
 * ./data/mle-prices.json; client-claimed prices are never trusted.
 *
 * Env: STRIPE_SECRET_KEY, optional PUBLIC_BASE_URL.
 * POST /api/create-checkout-session
 * body: { lines: [{ handle, variantId, quantity }], ndis?: {...} }
 * returns: { url }
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICES = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "mle-prices.json"), "utf8"));

const BASE_URL = process.env.PUBLIC_BASE_URL ?? "https://yumi-luxury.netlify.app";

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return json(503, {
      error: "Checkout is not configured yet: STRIPE_SECRET_KEY is not set. Add it in Netlify → Site settings → Environment variables.",
    });
  }

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Invalid JSON body" }); }

  const lines = Array.isArray(body?.lines) ? body.lines : [];
  if (lines.length === 0) return json(400, { error: "Your selection is empty" });
  if (lines.length > 50) return json(400, { error: "Too many items in one order" });

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${BASE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${BASE_URL}/`);
  form.set("billing_address_collection", "required");
  form.set("shipping_address_collection[allowed_countries][0]", "AU");
  form.set("shipping_address_collection[allowed_countries][1]", "NZ");
  form.set("shipping_address_collection[allowed_countries][2]", "US");
  form.set("shipping_address_collection[allowed_countries][3]", "GB");
  form.set("shipping_address_collection[allowed_countries][4]", "CA");
  form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  form.set("shipping_options[0][shipping_rate_data][display_name]", "Express (7-14 days)");
  form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", "1500");
  form.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "aud");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]", "business_day");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]", "7");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]", "business_day");
  form.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]", "14");
  form.set("metadata[channel]", "yumi_standalone");
  form.set("metadata[platform]", "netlify");

  let i = 0;
  for (const line of lines) {
    const entry = PRICES[line.handle];
    if (!entry) return json(400, { error: `Unknown product: ${line.handle}` });
    if (entry.variantId !== line.variantId) return json(400, { error: `Variant mismatch: ${line.handle}` });
    if (entry.amountCents == null) return json(400, { error: `${entry.title} has no published price yet` });
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return json(400, { error: "Quantity must be between 1 and 20" });
    form.set(`line_items[${i}][quantity]`, String(qty));
    form.set(`line_items[${i}][price_data][currency]`, "aud");
    form.set(`line_items[${i}][price_data][unit_amount]`, String(entry.amountCents));
    form.set(`line_items[${i}][price_data][product_data][name]`, entry.title);
    if (entry.category) form.set(`line_items[${i}][price_data][product_data][description]`, `Category: ${entry.category}`);
    if (entry.image) form.set(`line_items[${i}][price_data][product_data][images][0]`, entry.image);
    i++;
  }

  if (body.ndis && typeof body.ndis.participantName === "string") {
    form.set("metadata[ndis_invoice]", "true");
    form.set("metadata[ndis_participant]", body.ndis.participantName.slice(0, 120));
    form.set("metadata[ndis_number]", String(body.ndis.ndisNumber ?? "not-provided").slice(0, 60));
    form.set("metadata[ndis_email]", String(body.ndis.email ?? "not-provided").slice(0, 160));
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Stripe error:", JSON.stringify(data));
    return json(502, { error: data?.error?.message ?? "Stripe checkout failed" });
    }
    return json(200, { url: data.url, sessionId: data.id });
  } catch (err) {
    console.error("checkout failure:", err);
    return json(500, { error: "Checkout service unavailable" });
  }
};

export const config = { path: "/api/create-checkout-session" };
