# Progress — Yu+Mi · A.D.H.D

## From Lovable (pre-existing)
- [x] Full TanStack Start storefront: index/category/product/cart drawer/privacy/terms routes
- [x] Shopify Storefront wired (yu-mi-a-d-h-d-sanctuary-zd6hf.myshopify.com)
- [x] 100-product catalog art (src/assets), noir+gold theme, CartDrawer/zustand store

## Native wrap (Aug 15, this session — NDV playbook)
- [x] npm install (Capacitor 8.5.0 core/cli/android/ios added)
- [x] SPA build pipeline: `npm run build:app` — VERIFIED (prerender + _shell.html → index.html)
- [x] capacitor.config.ts — appId `au.com.yumiadhd`, appName `Yu+Mi`
- [x] `cap add android` + `cap add ios` (Cap 8 SPM layout for iOS)
- [x] Brand icons/splash: scripts/generate-icons.ps1 + generate-native-assets.ps1
      (PLACEHOLDER art — noir #201D1A + gold #D0A24C "Y+M" monogram; replace before stores)
- [x] Release signing: android/app/yumi-upload.keystore (alias yumi-upload) + root
      keystore.properties + signing config wired into android/app/build.gradle
      **BACK UP THESE TWO FILES — losing them means losing Play Store update rights.**
- [x] android/local.properties (sdk.dir)
- [x] cap sync ✅ (web assets into both platforms)
- [x] Debug APK — BUILD SUCCESSFUL 1m20s → android/app/build/outputs/apk/debug/app-debug.apk
- [x] Release AAB — app-release.aab (3.5 MB), BUILD SUCCESSFUL 1m52s, jarsigner verified ✅
- [x] Commit + push — 8826bb7 on main; secrets verified absent from tracking ✅
- [x] iOS CI GREEN — run 31843965790 (1m16s), YuMi-xcarchive-unsigned artifact ✅

## Next steps after wrap
- [ ] On-device test (adb + device/emulator)
- [ ] Privacy placeholders check (privacy.tsx already exists — verify entity/email/date)
- [ ] Store listings (copy NDV store/ docs as template: play-listing.md, appstore-listing.md)
- [ ] Web deploy (Netlify like NDV: npm run build:app → dist/client static)
- [ ] Store accounts: Google Play ($25), Apple Developer ($99)
- [ ] Finalize appId before first upload (immutable after)
- [ ] Replace placeholder icons/splash with final artwork
- [ ] CATALOG AUDIT: verify Shopify product images (same watermark risk as NDV had —
      scripts/audit-shopify-images.mjs exists at C:\dev\ndv\scripts and can be adapted)
