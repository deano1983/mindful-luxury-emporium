// Native-app-shell build config (Capacitor). Builds the app as a static SPA:
// no Nitro server, no server routes. The storefront runs fully client-side
// against the Shopify Storefront API. VITE_APP_SHELL=true is set via
// .env.appshell (loaded only for --mode appshell).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: { enabled: true, crawlLinks: false },
    },
  },
});
