import type { CapacitorConfig } from "@capacitor/cli";

// Yu+Mi · A.D.H.D — native shell for the TanStack Start SPA build (npm run build:app).
// The storefront runs client-side against the Shopify Storefront API,
// so no hosted backend is required for catalog/cart/checkout.
const config: CapacitorConfig = {
  appId: "au.com.yumiadhd", // TODO: confirm final ID before store submission (immutable after first store upload)
  appName: "Yu+Mi",
  webDir: "dist/client",
  server: {
    // https scheme keeps Shopify fetch/CORS and storage behavior consistent in the WebView
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#201D1A", // noir brand base
  },
  ios: {
    backgroundColor: "#201D1A",
  },
};

export default config;
