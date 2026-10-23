# Yu+Mi ADHD Sanctuary — deploy dist/client to Netlify (fwd-slash zip entries, curl.exe upload).
# TRAP: ZipFile.CreateFromDirectory writes backslash entries -> blank page on Netlify.
# TRAP: Invoke-RestMethod with byte[] body sends an EMPTY deploy. Use curl.exe --data-binary.
# Usage: powershell -File scripts\deploy-netlify.ps1
$ErrorActionPreference = "Stop"
$root = "C:\dev\mindful-luxury-emporium"
$dist = Join-Path $root "dist\client"
$token = (Get-Content "C:\dev\ndv\.netlify-token" -Raw).Trim()
$site = "ffb19c35-de7b-4e89-bf40-496512cc85a0"
$zip = Join-Path $env:TEMP "mle-deploy.zip"

if (-not (Test-Path $dist)) { throw "dist\client not found - run npm run build first" }
if (Test-Path $zip) { Remove-Item $zip -Force }

Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$fs = [IO.File]::Open($zip, 'Create')
$archive = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create)
try {
  $files = Get-ChildItem $dist -Recurse -File
  foreach ($f in $files) {
    $rel = $f.FullName.Substring($dist.Length + 1).Replace('\', '/')   # FORWARD slashes
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $f.FullName, $rel, 'Optimal')
  }
  # STANDALONE CHECKOUT: bundle the Netlify function with esbuild (inlines the price
  # JSON -> self-contained), then ship it + netlify.toml inside the deploy zip.
  $bundleDir = Join-Path $env:TEMP "mle-fn-bundle"
  if (Test-Path $bundleDir) { Remove-Item $bundleDir -Recurse -Force }
  New-Item -ItemType Directory -Force $bundleDir | Out-Null
  $bundleOut = Join-Path $bundleDir "create-checkout-session.mjs"
  & (Join-Path $root "node_modules\.bin\esbuild.cmd") `
    (Join-Path $root "netlify\functions\create-checkout-session.mjs") `
    --bundle --platform=node --format=esm `
    "--external:node:*" `
    --outfile=$bundleOut
  if ($LASTEXITCODE -ne 0) { throw "esbuild function bundle failed" }
  $rootFiles = @((Join-Path $root "netlify.toml"), $bundleOut)
  foreach ($f in $rootFiles) {
    if (-not (Test-Path $f)) { continue }
    $rel = if ($f -eq $bundleOut) {
      "netlify/functions/" + [IO.Path]::GetFileName($f)
    } else { [IO.Path]::GetFileName($f) }
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $f, $rel, 'Optimal')
  }
} finally {
  $archive.Dispose(); $fs.Dispose()
}
$count = (Get-ChildItem $dist -Recurse -File).Count
$size = [math]::Round((Get-Item $zip).Length / 1MB, 2)
Write-Output "zip: $count entries, $size MB (fwd-slash verified)"

& curl.exe -s -X POST "https://api.netlify.com/api/v1/sites/$site/deploys" `
  -H "Authorization: Bearer $token" -H "Content-Type: application/zip" `
  --data-binary "@$zip" -o "$env:TEMP\mle-deploy.json"
$resp = Get-Content "$env:TEMP\mle-deploy.json" -Raw | ConvertFrom-Json
Write-Output "deploy id: $($resp.id)  state: $($resp.state)"
if (-not $resp.id) { throw "deploy failed: $resp" }

# Zip deploys do NOT register functions from netlify.toml — upload the pre-bundled
# function to the deploy via the Deploy Functions API (zip root = entry .mjs file).
$fnZip = Join-Path $env:TEMP "mle-fn-upload.zip"
if (Test-Path $fnZip) { Remove-Item $fnZip -Force }
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$fnFs = [IO.File]::Open($fnZip, 'Create')
$fnArchive = New-Object IO.Compression.ZipArchive($fnFs, [IO.Compression.ZipArchiveMode]::Create)
try {
  [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
    $fnArchive, $bundleOut, "create-checkout-session.mjs", 'Optimal')
} finally { $fnArchive.Dispose(); $fnFs.Dispose() }
& curl.exe -s -X POST "https://api.netlify.com/api/v1/functions/deploys/$($resp.id)/create-checkout-session" `
  -H "Authorization: Bearer $token" -H "Content-Type: application/zip" `
  --data-binary "@$fnZip" -o "$env:TEMP\mle-fn-deploy.json"
$fnResp = Get-Content "$env:TEMP\mle-fn-deploy.json" -Raw
Write-Output "function deploy: $($fnResp.Substring(0, [Math]::Min(200, $fnResp.Length)))"
Write-Output "watch: https://app.netlify.com/projects/yumi-adhd-sanctuary/deploys/$($resp.id)"
