# Active Context — READ THIS FIRST when resuming

_Last updated: 2026-08-15 — NATIVE WRAP IN PROGRESS (following NDV playbook)_

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
- [ ] npm install (RUNNING in background at session checkpoint)
- [ ] npm run build:app verified
- [ ] cap add android + ios
- [ ] icons/splash generated into platforms (run generate-icons.ps1 THEN generate-native-assets.ps1)
- [ ] yumi-upload.keystore + keystore.properties + signing config in android/app/build.gradle
      (pattern: copy from C:\dev\ndv\android\app\build.gradle lines 19-41)
- [ ] android/local.properties (sdk.dir=C:\\Users\\DC\\AppData\\Local\\Android\\Sdk)
- [ ] assembleDebug APK + bundleRelease AAB (jarsigner verify)
- [ ] commit + push to GitHub, trigger iOS CI (gh run)

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
