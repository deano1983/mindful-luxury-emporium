// TanStack Start SPA mode emits the app shell as dist/client/_shell.html.
// Capacitor (and any static host) expects index.html — copy it into place.
import { copyFileSync } from "node:fs";

copyFileSync("dist/client/_shell.html", "dist/client/index.html");
console.log("[app-shell] dist/client/_shell.html -> dist/client/index.html");
