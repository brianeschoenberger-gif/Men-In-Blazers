# Asset Runtime Checklist

This directory is the runtime destination for hero/transition polish assets.

## Current State
- Placeholder brand assets are present (`brand/wordmark_light.svg`, `brand/mark_light.svg`).
- Hero tunnel-exit crowd plate is present (`textures/hero/stadium_crowd_plate.webp` and `_1k` variant).
- All other files listed in `src/three/assets/assetManifest.ts` are optional and currently fall back to procedural rendering when missing.

## Source Workflow
1. Add source files under `Assets/`.
2. Run:
   `powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1`
3. Copy optimized runtime files into the matching `src/assets/...` paths.
4. Keep filenames aligned with the keys in `src/three/assets/assetManifest.ts`.

## Texture Policy
- High tier: 2k texture set.
- Mid/low tier: 1k variants where available (`*_1k.webp`).
