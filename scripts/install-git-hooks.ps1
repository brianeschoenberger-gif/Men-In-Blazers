param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$rootPath = (Resolve-Path $Root).Path
$hooksDir = Join-Path $rootPath ".git/hooks"
$hookPath = Join-Path $hooksDir "pre-commit"

if (-not (Test-Path $hooksDir)) {
  throw "Git hooks directory not found. Is this a git repository?"
}

$hook = @'
#!/usr/bin/env bash
set -euo pipefail

staged_files="$(git diff --cached --name-only)"

if echo "$staged_files" | grep -E '^\.agents/skills/' >/dev/null 2>&1; then
  echo "[pre-commit] .agents/skills change detected. Regenerating SKILLS.md and skills.json..."
  powershell -ExecutionPolicy Bypass -File scripts/sync-skills-registry.ps1
  git add SKILLS.md skills.json
  staged_files="$(git diff --cached --name-only)"
fi

project_change_pattern='^(src/|tests/|public/|Assets/|scripts/|package\.json|package-lock\.json|vite\.config\.ts|tsconfig(\.app|\.node)?\.json|playwright\.config\.ts|README\.md|SPEC\.md|PRODUCT\.md|STORYBOARD_HERO_TRANSITION\.md|ASSETS\.md|Assets\.json|MILESTONES\.md|AGENTS\.md)$'

if echo "$staged_files" | grep -E "$project_change_pattern" >/dev/null 2>&1; then
  if ! echo "$staged_files" | grep -x 'PROGRESS.md' >/dev/null 2>&1; then
    echo "[pre-commit] Project changes detected, but PROGRESS.md is not staged."
    echo "[pre-commit] Add/update PROGRESS.md and stage it before committing."
    exit 1
  fi
fi
'@

[IO.File]::WriteAllText($hookPath, $hook + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))

try {
  & git update-index --chmod=+x ".git/hooks/pre-commit" 2>$null | Out-Null
} catch {
}

Write-Output "Installed git pre-commit hook at .git/hooks/pre-commit"
