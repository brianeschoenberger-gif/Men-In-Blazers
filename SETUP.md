# SETUP.md

## Purpose
Environment prep checklist so Milestones 0-2 can run smoothly and all installed skills are usable.

## Project Commands
Install and run:

```powershell
cmd /c npm install
cmd /c npm run dev
```

Build check:

```powershell
cmd /c npm run build
```

## Skills Health Check
Confirm local skill registries:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-skills-registry.ps1
Get-Content SKILLS.md -TotalCount 40
```

## Asset Catalog Update
Whenever files in `Assets/` change:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1
```

## MCP Setup (Needed For Some Skills)
`figma-implement-design` and `web-perf` depend on MCP services.

Add Figma MCP:

```powershell
codex mcp add figma --url https://mcp.figma.com/mcp
codex mcp login figma
```

Add Chrome DevTools MCP for `web-perf`:

```powershell
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```

Verify:

```powershell
codex mcp list
```

## API Key Setup (Needed For imagegen/sora)
Set your OpenAI key for this terminal session:

```powershell
$env:OPENAI_API_KEY = "YOUR_KEY_HERE"
```

Persist for future terminals:

```powershell
setx OPENAI_API_KEY "YOUR_KEY_HERE"
```

Install Python deps for image generation CLI:

```powershell
python -m pip install openai pillow
```

Quick imagegen health check:

```powershell
python scripts/image_gen.py generate --prompt "health check" --dry-run
```

## Windows Notes
- In this environment, `npm` can be blocked by PowerShell execution policy.
- Use `cmd /c npm ...` and `cmd /c npx ...` if direct `npm` fails.
