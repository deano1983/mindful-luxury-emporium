// STANDALONE (detached from Lovable): vanilla Vite + TanStack Start config.
// Replaces @lovable.dev/vite-tanstack-config. Lovable dev-time extras dropped.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      spa: {
        enabled: true,
        prerender: { enabled: true, crawlLinks: false },
      },
    }),
    viteReact(),
  ],
});
