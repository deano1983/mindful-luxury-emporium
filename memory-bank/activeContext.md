# Active Context — READ THIS FIRST when resuming

## 💳 2026-08-29: NDIS PAYMENTS & INVOICING — ADDED (mirrors NDV)
- Same two-option NDIS checkout as NDV (see C:\dev\ndv\memory-bank\activeContext.md):
  CartDrawer NDIS section + /ndis route + Footer link; Shopify cart attributes
  (cartAttributesUpdate in cartStore.setNdisAttributes) for the card flow.
- New: src/lib/ndis.ts (brand: "Yu+Mi · A.D.H.D Sanctuary", contact
  concierge@yumiadhd.co, prefix YMA, AUD), components/NdisCheckout.tsx +
  NdisInvoicePreview.tsx, routes/ndis.tsx. Client-side tax invoice (print/PDF/
  download/mailto) — works in web + app WebView, no backend needed.
- ✅ 29/08 (later): ABN 61 794 639 443 / ACN 72 448 917 / Commonwealth Bank BSB 062-948
  Acct 72448917 filled in src/lib/ndis.ts; own scripts/deploy-netlify.ps1 added
  (site ffb19c35-de7b-4e89-bf40-496512cc85a0). Full pipeline (build + cap copy +
  AAB + deploy) run via C:\dev\ndis-full-pipeline.bat — logs C:\dev\mle-*.log.

_Last updated: 2026-08-24 — DSers mapping CSV exported (93 products, supplier URLs verified absent)_

## 📦 2026-08-24: DSers product-mapping CSV
- `store/dsers-product-mapping.csv` — 93 rows: live numeric Shopify product IDs + titles +
  handles (fresh Storefront API pull). Supplier columns BLANK: verified 0 products carry
  `custom.supplier_url` metafields / AliExpress links in descriptions; source URLs from the
  original import were never recorded. Fill via DSers image search, then re-run
  `scripts/export-dsers-mapping.mjs <shop> <token> <out.csv>` (auto-fills from
  custom.supplier_url/supplier_name metafields or description URLs). Script identical to
  NDV's. Store: yu-mi-a-d-h-d-sanctuary-zd6hf.myshopify.com.


## Web deploy — LIVE
- Netlify site: **yumi-adhd-sanctuary** (id ffb19c35-de7b-4e89-bf40-496512cc85a0), deployed via
  zip API (deploy_source=api), reusing NDV's token from C:\dev\ndv\.netlify-token.
- /privacy + /terms resolve via public/_redirects SPA fallback (/* /index.html 200) ✅
- ⚠️ GOTCHA: sites created via API inherited sso_login=True (edge-access 401 "Login Redirect").
  Fix: PATCH /sites/{id} {"sso_login":false,"account_sso_login":false} → 200. Remember for future sites.
- Custom domain: none yet — options yumiadhd.com.au etc.; wire in Netlify dashboard when bought.
- Store listings drafted: store/play-listing.md + store/appstore-listing.md (privacy URL live).

## Project
Yu+Mi · A.D.H.D — luxury store for neurodivergent men. Lovable-generated TanStack Start app.
Repo: **https://github.com/deano1983/mindful-luxury-emporium** (PUBLIC — do NOT commit secrets;
keystore + keystore.properties are gitignored). Sister project: C:\dev\ndv (NDV, women's label).

## Native wrap (mirroring NDV format) — status
- [x] App-shell pipeline added: vite.config.app.ts (nitro off, SPA+prerender) + .env.appshell
      (VITE_APP_SHELL=true) + scripts/prepare-app-shell.mjs; package.json scripts build:app/app:sync
- [x] Capacitor 8.5 deps added (@capacitor/core/cli/android/ios)
- [x] capacitor.config.ts: appId `au.com.yumiadhd` (placeholder, confirm pre-store),
      appName `Yu+Mi`, webDir dist/client, androidScheme https, bg #201D1A (noir)
- [x] scripts/generate-icons.ps1 + generate-native-assets.ps1 (System.Drawing, NO @capacitor/assets
      — win32-only sharp breaks `npm ci` on macOS CI, learned from NDV)
- [x] .github/workflows/ios-build.yml (unsigned xcodebuild -project App.xcodeproj archive;
      Capacitor 8 = SPM, NO workspace)
- [x] .gitignore: .env (!.env.appshell), *.keystore, keystore.properties, native outputs, .audit/
- [x] npm install, build:app verified, cap add android + ios, icons/splash generated
- [x] yumi-upload.keystore (alias yumi-upload, in android/app/) + keystore.properties (root)
      + signing config in android/app/build.gradle. **BACK UP BOTH FILES.**
- [x] android/local.properties (sdk.dir)
- [x] Debug APK: android/app/build/outputs/apk/debug/app-debug.apk (4.7 MB)
- [x] Release AAB: android/app/build/outputs/bundle/release/app-release.aab (3.5 MB),
      jarsigner verified (self-signed upload key — expected)
- [x] Pushed: commit 8826bb7 → github.com/deano1983/mindful-luxury-emporium (PUBLIC)
- [x] iOS CI GREEN first try (run 31843965790, 1m16s) — artifact YuMi-xcarchive-unsigned

## Environment (same machine as NDV)
- JDK 21 at C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot (JAVA_HOME set) — Cap 8 needs Java 21
- Android SDK headless at %LOCALAPPDATA%\Android\Sdk (platforms;android-36, build-tools 36.0.0)
- git at C:\Program Files\Git\bin\git.exe (NOT on PATH in fresh shells)
- gh CLI at C:\Program Files\GitHub CLI\gh.exe (authed as deano1983, workflow scope)
- Node on PATH as node/npm; run_commands has ~30s timeout — use Start-Process + poll for long tasks
- Gradle caches warm from NDV builds → first build here should be much faster than NDV's

## Watch-outs (inherited from NDV)
- Do NOT install @capacitor/assets or @img/sharp-win32-x64 (breaks macOS npm ci)
- Use `npm run build:app` for web/native deploys (plain `build` = SSR/nitro)
- Shopify calls are client-side → work in WebView. No server-only features exist here
  (no Concierge/MCP unlike NDV), so nothing to gate behind VITE_APP_SHELL.
- Command timeout 30s: background long builds via Start-Process with -RedirectStandard*.
