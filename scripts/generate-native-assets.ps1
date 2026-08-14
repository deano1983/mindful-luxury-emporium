# Generates ALL Android + iOS launcher/splash assets for the Capacitor shell
# from the brand monogram sources in ./assets (see generate-icons.ps1).
# Brand: gold #D0A24C "Y+M" monogram on noir #201D1A.
# Placeholder artwork — replace with designer assets before store submission.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$Root = "$PSScriptRoot\.."
$Assets = Join-Path $Root "assets"
$Noir = "#201D1A"
$Gold = "#D0A24C"

function Resize-To([string]$Src, [string]$Dst, [int]$W, [int]$H) {
  $img = [System.Drawing.Image]::FromFile($Src)
  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($img.PixelFormat -band [System.Drawing.Imaging.PixelFormat]::Alpha) {
    $g.Clear([System.Drawing.Color]::Transparent)
  }
  $g.DrawImage($img, 0, 0, $W, $H)
  $bmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}

function New-Splash([string]$Dst, [int]$W, [int]$H) {
  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml($Noir))
  $base = [Math]::Min($W, $H)
  $font = New-Object System.Drawing.Font("Georgia", [int]($base * 0.16), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($Gold))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, 0, $W, [int]($H * 0.92))
  $g.DrawString("Y+M", $font, $brush, $rect, $sf)
  $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($Gold), [Math]::Max(2, [int]($base / 300)))
  $lineW = $base * 0.22
  $y = $H * 0.60
  $g.DrawLine($pen, [single](($W - $lineW) / 2), [single]$y, [single](($W + $lineW) / 2), [single]$y)
  $bmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose(); $brush.Dispose(); $font.Dispose(); $g.Dispose(); $bmp.Dispose()
}

function New-RoundIcon([string]$Src, [string]$Dst, [int]$Size) {
  $img = [System.Drawing.Image]::FromFile($Src)
  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse(0, 0, $Size, $Size)
  $g.SetClip($path)
  $g.DrawImage($img, 0, 0, $Size, $Size)
  $bmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose(); $path.Dispose()
}

$iconOnly = Join-Path $Assets "icon-only.png"
$iconFg   = Join-Path $Assets "icon-foreground.png"

# ---------- ANDROID ----------
$androidRes = Join-Path $Root "android\app\src\main\res"
$densities = @{
  "mdpi"    = @{ launcher = 48;  foreground = 108 }
  "hdpi"    = @{ launcher = 72;  foreground = 162 }
  "xhdpi"   = @{ launcher = 96;  foreground = 216 }
  "xxhdpi"  = @{ launcher = 144; foreground = 324 }
  "xxxhdpi" = @{ launcher = 192; foreground = 432 }
}
foreach ($d in $densities.GetEnumerator()) {
  $dir = Join-Path $androidRes "mipmap-$($d.Key)"
  Resize-To $iconOnly (Join-Path $dir "ic_launcher.png") $d.Value.launcher $d.Value.launcher
  New-RoundIcon $iconOnly (Join-Path $dir "ic_launcher_round.png") $d.Value.launcher
  Resize-To $iconFg (Join-Path $dir "ic_launcher_foreground.png") $d.Value.foreground $d.Value.foreground
  Write-Output "android mipmap-$($d.Key) done"
}

# Adaptive icon background color -> noir
Set-Content -Path (Join-Path $androidRes "values\ic_launcher_background.xml") -Value @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">$Noir</color>
</resources>
"@

# Splash screens (portrait + landscape densities)
$splashSizes = @{
  "drawable-port-mdpi"    = @(320, 480);  "drawable-port-hdpi"    = @(480, 800)
  "drawable-port-xhdpi"   = @(720, 1280); "drawable-port-xxhdpi"  = @(960, 1600)
  "drawable-port-xxxhdpi" = @(1280, 1920)
  "drawable-land-mdpi"    = @(480, 320);  "drawable-land-hdpi"    = @(800, 480)
  "drawable-land-xhdpi"   = @(1280, 720); "drawable-land-xxhdpi"  = @(1600, 960)
  "drawable-land-xxxhdpi" = @(1920, 1280)
  "drawable"              = @(480, 800)
}
foreach ($s in $splashSizes.GetEnumerator()) {
  New-Splash (Join-Path $androidRes "$($s.Key)\splash.png") $s.Value[0] $s.Value[1]
  Write-Output "android $($s.Key) splash done"
}

# ---------- iOS ----------
$iosAssets = Join-Path $Root "ios\App\App\Assets.xcassets"
Copy-Item $iconOnly (Join-Path $iosAssets "AppIcon.appiconset\AppIcon-512@2x.png") -Force
$iosSplash = Join-Path $Assets "splash.png"
foreach ($f in @("splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png")) {
  Copy-Item $iosSplash (Join-Path $iosAssets "Splash.imageset\$f") -Force
}
Write-Output "ios assets done"
Write-Output "ALL NATIVE ASSETS GENERATED"
