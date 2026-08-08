$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$cssFiles = @("css/variables.css","css/base.css","css/components.css","css/pages.css","css/animations.css")
$css = "/* DW site.css — generated */`n"
foreach ($f in $cssFiles) { $css += "/* $f */`n" + (Get-Content -Raw $f) + "`n" }
[System.IO.File]::WriteAllText("$root\css\site.css", $css)
$jsFiles = @(
  "js/config.js","js/utils.js","js/data-loader.js","js/forms.js","js/perf.js",
  "js/components/navbar.js","js/components/hero.js","js/components/section-header.js",
  "js/components/stats.js","js/components/program-card.js","js/components/testimonial-card.js",
  "js/components/article-card.js","js/components/video-card.js","js/components/event-card.js",
  "js/components/media-logo.js","js/components/cta-section.js","js/components/newsletter-form.js",
  "js/components/contact-form.js","js/components/footer.js","js/components/resource-gate.js",
  "js/components/registry.js","js/scroll-animations.js","js/main.js"
)
$js = "/* DW site.bundle.js — generated */`n"
foreach ($f in $jsFiles) { $js += "/* $f */`n" + (Get-Content -Raw $f) + "`n;`n" }
[System.IO.File]::WriteAllText("$root\js\site.bundle.js", $js)
Write-Host "Built css/site.css and js/site.bundle.js"
