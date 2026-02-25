# ASSETS.md

## Canonical Lookup
- Source library: `Assets/`
- Canonical index: `Assets.json`
- Runtime destination (when needed): `src/assets/`

Always resolve assets via `Assets.json` first, then copy/optimize into `src/assets/` for production usage.

## Regeneration
After adding/removing/renaming files in `Assets/`, regenerate the catalog:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1
```

## Asset Strategy (MVP)
Build Milestone 1–2 with placeholders first.
If assets are missing, code MUST fall back to procedural materials/colors and leave TODOs.

## Required Assets (Nice-to-have but recommended)

### Brand / UI
- `src/assets/brand/logo.svg` (optional placeholder ok)
- Fonts: system fonts ok for MVP, but define choice later

### Tunnel Look (choose one approach)

#### Option A: Procedural tunnel (no model needed)
No model required. Use box geometry segments.

**Recommended textures (tileable PBR)**
Place under `src/assets/textures/`:
- `tunnel_wall_albedo.webp`
- `tunnel_wall_normal.webp`
- `tunnel_wall_roughness.webp`
- `tunnel_floor_albedo.webp`
- `tunnel_floor_normal.webp`
- `tunnel_floor_roughness.webp`

If missing: fallback to simple MeshStandardMaterial colors + roughness.

#### Option B: Tunnel model
- `src/assets/models/tunnel.glb`

If missing: fallback to procedural tunnel.

### Particles / Overlays
- `src/assets/sprites/dust_mote.png` (alpha sprite)
- `src/assets/sprites/soft_glow.png` (optional)
- `src/assets/overlays/film_grain.png` (optional)
- `src/assets/overlays/vignette.png` (optional)
- `src/assets/sprites/light_streak.png` (optional for transition)

If missing: generate particles procedurally or use basic circle sprites.

## Reference Media (Not shipped, dev-only)
Store under `Assets/` and register entries in `Assets.json` (do not bundle for production):
- `Assets/20260225_1243_01kjb7hvpff0wa3y2484cm199p.mp4` (Sora hero reference video)
- Add frame exports to `Assets/` when available and index them in `Assets.json`

## Performance Notes
- Prefer WebP/AVIF for large textures where possible
- Keep texture dimensions reasonable (e.g., 1024–2048)
- On mobile: reduce particles and disable bloom/postprocessing

## Reduced Motion Requirements
When `prefers-reduced-motion`:
- Disable camera drift
- Greatly reduce particles
- Prefer fading between states rather than scrubbing complex motion
