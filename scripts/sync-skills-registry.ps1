param(
  [string]$Root = ".",
  [string]$SkillsRoot = ".agents/skills",
  [string]$SkillsMarkdown = "SKILLS.md",
  [string]$SkillsJson = "skills.json"
)

$ErrorActionPreference = "Stop"

function Read-FrontMatter {
  param([string]$Content)
  $m = [regex]::Match($Content, "^(?:---\r?\n)([\s\S]*?)(?:\r?\n---)", [System.Text.RegularExpressions.RegexOptions]::Multiline)
  if (-not $m.Success) { return "" }
  return $m.Groups[1].Value
}

function Get-FrontMatterValue {
  param(
    [string]$FrontMatter,
    [string]$Key
  )
  $m = [regex]::Match($FrontMatter, "(?m)^\s*$([regex]::Escape($Key)):\s*(.+?)\s*$")
  if (-not $m.Success) { return $null }
  $value = $m.Groups[1].Value.Trim()
  if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  return $value
}

function Normalize-Text {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
  $text = $Value -replace "\s+", " "
  return $text.Trim()
}

function Infer-Category {
  param([string]$Folder, [string]$Name, [string]$Description)
  $s = (($Folder + " " + $Name + " " + $Description).ToLower())
  if ($s -match "threejs|three\.js") { return "3d" }
  if ($s -match "playwright|browser|test|automation|automating") { return "testing" }
  if ($s -match "figma|design") { return "design" }
  if ($s -match "image|screenshot") { return "media" }
  if ($s -match "perf|lighthouse|web vitals") { return "performance" }
  if ($s -match "react|next") { return "frontend" }
  return "general"
}

$rootPath = (Resolve-Path $Root).Path
$skillsPath = Join-Path $rootPath $SkillsRoot
$mdPath = Join-Path $rootPath $SkillsMarkdown
$jsonPath = Join-Path $rootPath $SkillsJson

if (-not (Test-Path $skillsPath)) {
  throw "Skills directory not found: $skillsPath"
}

$entries = @()
$dirs = Get-ChildItem -Path $skillsPath -Directory | Sort-Object Name

foreach ($dir in $dirs) {
  $skillFile = Join-Path $dir.FullName "SKILL.md"
  if (-not (Test-Path $skillFile)) { continue }

  $content = Get-Content -Raw -Path $skillFile
  $fm = Read-FrontMatter -Content $content

  $name = Get-FrontMatterValue -FrontMatter $fm -Key "name"
  if ([string]::IsNullOrWhiteSpace($name)) { $name = $dir.Name }
  $description = Normalize-Text (Get-FrontMatterValue -FrontMatter $fm -Key "description")
  $category = Infer-Category -Folder $dir.Name -Name $name -Description $description
  $relativeSkillPath = $skillFile.Substring($rootPath.Length + 1) -replace "\\", "/"

  $entries += [ordered]@{
    folder = $dir.Name
    name = $name
    description = $description
    category = $category
    skillFile = $relativeSkillPath
  }
}

$entries = @($entries | Sort-Object folder)

$doc = [ordered]@{
  version = 1
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  skillsRoot = $SkillsRoot -replace "\\", "/"
  notes = @(
    "Auto-generated from local skill manifests under .agents/skills.",
    "Run scripts/sync-skills-registry.ps1 after adding or updating skills."
  )
  skills = $entries
}

$json = $doc | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($jsonPath, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# SKILLS.md")
$lines.Add("")
$lines.Add("## Purpose")
$lines.Add("Canonical human-readable skill routing guide for this repository.")
$lines.Add("")
$lines.Add("## Auto-Update")
$lines.Add('Regenerate this file and `skills.json` whenever skills change:')
$lines.Add("")
$lines.Add('```powershell')
$lines.Add("powershell -ExecutionPolicy Bypass -File scripts/sync-skills-registry.ps1")
$lines.Add('```')
$lines.Add("")
$lines.Add("## Skill Selection Rule")
$lines.Add("- Before substantial implementation or review, select applicable skills from this list.")
$lines.Add("- Use the minimum set of skills that covers the task.")
$lines.Add("- If no skill applies, continue with normal engineering workflow.")
$lines.Add("")
$lines.Add("## Installed Skills")

foreach ($e in $entries) {
  $lines.Add("")
  $lines.Add("### $($e.folder)")
  $lines.Add(('- Name: `{0}`' -f $e.name))
  $lines.Add(('- Category: `{0}`' -f $e.category))
  $lines.Add(('- Skill file: `{0}`' -f $e.skillFile))
  if (-not [string]::IsNullOrWhiteSpace($e.description)) {
    $lines.Add("- Use when: $($e.description)")
  } else {
    $lines.Add("- Use when: See SKILL.md details.")
  }
}

[IO.File]::WriteAllLines($mdPath, $lines, [Text.UTF8Encoding]::new($false))

Write-Output "Updated $SkillsMarkdown and $SkillsJson from $($entries.Count) installed skills."
