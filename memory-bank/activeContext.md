# Active Context — READ THIS FIRST when resuming

_Last updated: 2026-08-15 — NATIVE WRAP COMPLETE: APK + signed AAB built, iOS CI GREEN, pushed to GitHub_

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
