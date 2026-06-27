import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { CATEGORIES } from "@/lib/shopify";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        const lines = [
          "# Yu+Mi · A.D.H.D",
          "",
          "> Curated luxury fashion, electronics, and sensory objects for neurodivergent men of taste — designed to soften the world.",
          "",
          "## Categories",
          "",
          ...CATEGORIES.map(c => `- [${c.title}](/category/${c.slug}): ${c.blurb}`),
          "",
        ].join("\n");
        return new Response(lines, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});