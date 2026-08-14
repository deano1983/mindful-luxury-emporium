# Generates Yu+Mi brand icon/splash source PNGs for @capacitor/assets.
# Placeholder artwork: gold "Y+M" monogram on the noir brand base.
# Replace assets/*.png with final designer artwork before store submission.
param(
  [string]$OutDir = "$PSScriptRoot\..\assets",
  [string]$Noir = "#201D1A",
  [string]$Gold = "#D0A24C"
)
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

function New-Monogram([string]$Path, [int]$Size, [bool]$TransparentBg, [double]$TextScale, [string]$BgColor) {
  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  if ($TransparentBg) { $g.Clear([System.Drawing.Color]::Transparent) }
  else { $g.Clear([System.Drawing.ColorTranslator]::FromHtml($BgColor)) }

  $emSize = [Math]::Max(8, [int]($Size * $TextScale))
  $font = New-Object System.Drawing.Font("Georgia", $emSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($Gold))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
  $g.DrawString("Y+M", $font, $brush, $rect, $sf)

  # Thin gold baseline accent under the monogram
  $penW = [Math]::Max(2, [int]($Size / 256))
  $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($Gold), $penW)
  $lineW = $Size * 0.28
  $y = $Size * 0.68
  $g.DrawLine($pen, [single](($Size - $lineW) / 2), [single]$y, [single](($Size + $lineW) / 2), [single]$y)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose(); $brush.Dispose(); $font.Dispose(); $g.Dispose(); $bmp.Dispose()
  Write-Output "wrote $Path ($Size x $Size)"
}

New-Monogram (Join-Path $OutDir "icon-only.png")       1024 $false 0.34 $Noir
New-Monogram (Join-Path $OutDir "icon-foreground.png") 1024 $true  0.26 $Noir
New-Monogram (Join-Path $OutDir "splash.png")          2732 $false 0.16 $Noir
New-Monogram (Join-Path $OutDir "splash-dark.png")     2732 $false 0.16 $Noir
