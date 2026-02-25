param(
  [string]$Root = ".",
  [string]$AssetsDir = "Assets",
  [string]$Output = "Assets.json"
)

$ErrorActionPreference = "Stop"

function Convert-ToSlug {
  param([string]$Value)
  $slug = $Value.ToLower()
  $slug = $slug -replace "[^a-z0-9]+", "_"
  $slug = $slug.Trim("_")
  if ([string]::IsNullOrWhiteSpace($slug)) {
    return "asset"
  }
  return $slug
}

function Get-AssetType {
  param([string]$Extension)
  switch ($Extension.ToLower()) {
    ".mp4" { return "video" }
    ".mov" { return "video" }
    ".webm" { return "video" }
    ".jpg" { return "image" }
    ".jpeg" { return "image" }
    ".png" { return "image" }
    ".webp" { return "image" }
    ".avif" { return "image" }
    ".svg" { return "vector" }
    default { return "file" }
  }
}

function Get-AssetTags {
  param([string]$Filename, [string]$Type)

  $name = $Filename.ToLower()
  $tags = New-Object System.Collections.Generic.List[string]

  if ($name -match "logo|brand|wordmark|medianetwork") { $tags.Add("brand") }
  if ($name -match "logo") { $tags.Add("logo") }
  if ($name -match "hero|splash") { $tags.Add("hero") }
  if ($name -match "transition|streak|confetti|energy") { $tags.Add("transition") }
  if ($name -match "sora") { $tags.Add("sora") }
  if ($name -match "hq|thumb|thumbnail") { $tags.Add("thumbnail") }
  if ($name -match "report|email") { $tags.Add("marketing") }
  if ($name -match "chatgpt|generated") { $tags.Add("generated") }
  if ($Type -eq "video") {
    $tags.Add("reference")
    $tags.Add("hero")
    $tags.Add("transition")
  }
  if ($tags.Count -eq 0) { $tags.Add("reference") }

  return @($tags | Select-Object -Unique)
}

$rootPath = (Resolve-Path $Root).Path
$assetsPath = Join-Path $rootPath $AssetsDir
$outputPath = Join-Path $rootPath $Output

if (-not (Test-Path $assetsPath)) {
  throw "Assets directory not found: $assetsPath"
}

$files = Get-ChildItem -Path $assetsPath -Recurse -File | Sort-Object FullName
$assets = @()
$usedIds = @{}

foreach ($file in $files) {
  $relative = $file.FullName.Substring($rootPath.Length + 1) -replace "\\", "/"
  $assetType = Get-AssetType -Extension $file.Extension
  $baseId = Convert-ToSlug -Value ([IO.Path]::GetFileNameWithoutExtension($file.Name))
  $id = $baseId
  $suffix = 2
  while ($usedIds.ContainsKey($id)) {
    $id = "{0}_{1}" -f $baseId, $suffix
    $suffix++
  }
  $usedIds[$id] = $true

  $assets += [ordered]@{
    id = $id
    filename = $file.Name
    sourcePath = $relative
    type = $assetType
    extension = $file.Extension.ToLower()
    sizeBytes = [int64]$file.Length
    sha256 = (Get-FileHash -Algorithm SHA256 -Path $file.FullName).Hash.ToLower()
    tags = @(Get-AssetTags -Filename $file.Name -Type $assetType)
  }
}

$brand = @($assets | Where-Object { $_.tags -contains "brand" } | ForEach-Object { $_.id })
$hero = @($assets | Where-Object { $_.tags -contains "hero" -or $_.tags -contains "sora" } | ForEach-Object { $_.id })
$transition = @($assets | Where-Object { $_.tags -contains "transition" -or $_.tags -contains "sora" } | ForEach-Object { $_.id })
$misc = @($assets | Where-Object { -not ($_.id -in $brand + $hero + $transition) } | ForEach-Object { $_.id })

$doc = [ordered]@{
  version = 1
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  root = $AssetsDir -replace "\\", "/"
  notes = @(
    "This file is the canonical asset catalog for the repository.",
    "Use sourcePath values for source media in Assets/.",
    "Copy or optimize into src/assets/ only when needed for runtime."
  )
  assets = $assets
  lookup = [ordered]@{
    brand = $brand
    heroReference = $hero
    transitionReference = $transition
    miscReference = $misc
  }
}

$json = $doc | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($outputPath, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))

Write-Output "Generated $Output with $($assets.Count) assets."
