# PROGRESS.md

## Update Rule
- Keep newest entry at the top.
- Update this file whenever milestone-related files change.
- Include milestone touched, what changed, validation, and next step.

## Entry Template
```md
## YYYY-MM-DD
- Milestones touched:
- Skills used (or "none"):
- Completed:
- Validation run:
- Remaining / next:
```

## 2026-02-26
- Milestones touched: 2 (Transition "Crowd Energy Surge" DOM overlay simplification pass).
- Skills used (or "none"): none (skipped specialized 3D skills because this was a focused DOM/layout cleanup and smoke assertion update).
- Completed:
  - Removed the visible transition overlay card (the second text box) from `TransitionSection`.
  - Kept transition beat/energy state in DOM via hidden `transition-state` node for choreography/test observability.
  - Added `.transition-state` visually-hidden utility styling.
  - Updated smoke tests to use `.transition-state` data attributes instead of visible transition card heading/meter assertions.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - Captured screenshots:
    - `test-results/checks/hero-desktop-no-transition-card.png`
    - `test-results/checks/transition-desktop-no-transition-card.png`
    - `test-results/checks/hero-mobile-no-transition-card.png`
- Remaining / next:
  - Confirm this temporary no-card transition treatment is approved.
  - Optional follow-up: add a minimal non-boxed transition label if you still want lightweight orientation text.

## 2026-02-26
- Milestones touched: 1 (Hero "Tunnel to Pitch" Slice 4 stadium pull layering/payoff), 2 (hero-to-transition visual continuity).
- Skills used (or "none"): `threejs-lighting`, `threejs-animation` (skipped `threejs-shaders` and `imagegen` to keep this pass low-cost, deterministic, and within current asset set).
- Completed:
  - Applied a quick amplitude tweak pass to the hero run-feel:
    - increased stride bob/sway and stride frequency,
    - increased FOV ramp/settle by ~15% for stronger momentum.
  - Implemented Slice 4 stadium payoff layering in `HeroScene`:
    - added stadium aperture veil and horizon glow planes,
    - added directional exit shafts (tier-gated away from low tier),
    - added secondary crowd parallax layer with depth motion,
    - added stadium rim lights that ramp during H4/H5,
    - added portal-frame ring treatment to improve threshold read.
  - Wired beat-driven opacity/intensity choreography so early beats stay restrained and late beats carry the payoff.
  - Preserved reduced-motion behavior and low-tier fallbacks.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - Captured screenshots:
    - `test-results/checks/hero-desktop-slice4.png`
    - `test-results/checks/hero-pull-desktop-slice4.png`
    - `test-results/checks/transition-desktop-slice4.png`
    - `test-results/checks/hero-mobile-slice4.png`
- Remaining / next:
  - Review the screenshot set and choose whether to push the payoff brighter at H5 (currently still conservative).
  - If desired, tune late-beat stadium layer opacities upward another 10-20% for a stronger "into stadium" moment.

## 2026-02-26
- Milestones touched: 1 (Hero "Tunnel to Pitch" camera-motion polish pass).
- Skills used (or "none"): `threejs-animation`, `threejs-fundamentals` (skipped `gsap-scrolltrigger` because pin/scrub timing and trigger ranges were intentionally unchanged).
- Completed:
  - Added a beat-aware hero run-curve (`getTunnelRunCurve`) so camera travel ramps more aggressively through H3-H5 while keeping a controlled early pace.
  - Added subtle procedural "stride" motion to camera translation (x/y sway+bob) to increase the sensation of moving down the tunnel.
  - Added a restrained camera FOV ramp-and-settle to amplify forward momentum without destabilizing readability.
  - Updated camera look-ahead targeting so framing tracks deeper into the tunnel as progress advances.
  - Preserved reduced-motion behavior by disabling run stride/FOV dynamics under reduced-motion mode and restoring baseline camera FOV on scene cleanup.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Visual side-by-side review of opening run-feel against the reference; tune stride amplitude/frequency by ~10-20% if needed.
  - If approved, continue with Slice 4 (stadium pull layering) for a stronger tunnel-to-stadium payoff.

## 2026-02-26
- Milestones touched: 1 (Hero "Tunnel to Pitch" lighting/readability pass), 2 (hero-to-transition exposure continuity).
- Skills used (or "none"): `threejs-lighting`, `threejs-fundamentals` (skipped `threejs-shaders` for this pass to keep the fix low-risk and performance-stable).
- Completed:
  - Reduced global scene darkening during the opening by adding active-phase-aware overlay treatment in `PageShell`/`globals.css` (lighter in hero, moderated in transition).
  - Rebalanced high-tier post-FX envelope to reduce vignette crush and lift mids (`visualProfiles.ts`).
  - Tuned Hero scene readability in `HeroScene.tsx`:
    - lighter fog color/range for better depth legibility,
    - stronger practical/fill lighting and added hemisphere fill for wall/floor separation,
    - brighter tunnel practical strips and ceiling practical visibility,
    - slightly stronger portal-adjacent crowd/pitch reveal to clarify stadium destination.
  - Warmed tunnel base/shadow style tokens to preserve mood without obscuring tunnel form.
- Validation run:
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - `cmd /c npm run lint` (rerun sequentially after an initial transient parallel race on `test-results` lookup)
- Remaining / next:
  - Visual review pass against the reference for H1-H3 tunnel identity and H4-H5 portal pull.
  - If approved, continue with Slice 3 (camera/stride/FOV motion polish) for stronger "running down the tunnel" sensation.

## 2026-02-26
- Milestones touched: 1 (hero text placement/scale refinement).
- Skills used (or "none"): none (skipped specialized skills because this was a targeted CSS layout/typography update).
- Completed:
  - Moved hero copy block lower in the viewport so the text sits under the main tunnel visual center.
  - Reduced hero headline scale on desktop and mobile for cleaner balance against the scene.
  - Preserved centered layout and DOM-first CTA/readability behavior.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Optional visual follow-up: tune vertical offset and headline size by another ~5-10% after your side-by-side review.

## 2026-02-26
- Milestones touched: deployment/tooling (GitHub Pages publishing reliability).
- Skills used (or "none"): none.
- Completed:
  - Updated `vite.config.ts` to set `base` to `/Men-In-Blazers/` during GitHub Actions builds so asset URLs resolve correctly on project pages.
  - Fixed Pages workflow in `.github/workflows/static.yml` to build the app (`npm ci`, `npm run build`) and upload `./dist` instead of uploading the raw repository.
  - Kept local dev behavior unchanged (`base` remains `/` outside GitHub Actions).
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
- Remaining / next:
  - Push these changes to `main` and confirm the latest Pages workflow run succeeds in the Actions tab.
  - Hard-refresh the site after deploy completes.

## 2026-02-26
- Milestones touched: 1-2 (hero ambient idle-motion layer).
- Skills used (or "none"): `threejs-animation`, `threejs-lighting` (`gsap-scrolltrigger` intentionally skipped because scroll mapping/pin timing was unchanged).
- Completed:
  - Added always-on hero idle motion independent of scroll progress in `HeroScene`:
    - subtle camera breathing/sway
    - portal glow/emissive idle pulse
    - slow portal ring movement
    - haze texture drift for atmospheric flow
  - Added low-cost continuous dust travel in `DustParticles` (group-level drift + bob), with separate drift speeds for the two hero dust layers.
  - Preserved reduced-motion safeguards by disabling these idle effects when reduced motion is active.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Optional: tune idle amplitude (camera sway and portal pulse) after your next visual review.

## 2026-02-26
- Milestones touched: 1 (Hero DOM overlay presentation pass).
- Skills used (or "none"): none (skipped specialized skills because this was a focused CSS layout/style adjustment only).
- Completed:
  - Removed the framed hero card treatment (border, radius, backdrop blur, card background, and decorative edge lines) so headline content sits directly on the scene.
  - Centered hero composition and text treatment to match a cleaner full-bleed headline direction.
  - Center-aligned hero metadata and CTA row, and widened title container for stronger single-hero statement styling.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Optional: if you want it even closer to the reference, we can tighten headline letter spacing and reduce CTA visual weight further.

## 2026-02-26
- Milestones touched: 1-2 (hero tunnel readability pass).
- Skills used (or "none"): `threejs-geometry`, `threejs-materials`, `threejs-lighting`, `threejs-animation` (`gsap-scrolltrigger` intentionally skipped because pin/scrub timing was not changed).
- Completed:
  - Rebuilt the Hero visual composition to read as a continuous corridor instead of layered camera-facing panes.
  - Removed pane-like hero layers (beam cards, front haze cards, and extra portal card stack) and replaced them with tunnel-native cues:
    - repeating structural ribs and side practical strips per segment
    - cylindrical/tube haze volumes running down the tunnel axis
    - floor depth treatment and a simplified end-state portal/crowd composition
  - Kept existing Milestone 1 requirements intact: DOM-first hero content, reduced-motion compatibility, and mobile/low-tier stability.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - If this direction is approved, refresh hero visual baselines with `cmd /c npm run test:visual:update`.
  - Optional follow-up: tune tunnel rib contrast and spacing against your preferred Sora reference frame.

## 2026-02-26
- Milestones touched: 1-2 (hero "Tunnel to Pitch" art pass refinement).
- Skills used (or "none"): `threejs-textures`, `threejs-materials`, `threejs-lighting`, `threejs-animation` (`gsap-scrolltrigger` intentionally skipped because scroll choreography was not changed).
- Completed:
  - Upgraded `HeroScene` tunnel material response by wiring optional AO maps with `uv2` setup on segment geometry.
  - Added a richer practical-light stack (side practical strips + retuned ceiling/beam behavior) to better define depth during H2-H4.
  - Added a layered portal finish (halo, rim veil, and floor bounce) with beat-aware opacity/intensity so H5 reads brighter without fully washing out the tunnel.
  - Kept reduced-motion and tiered fallback behavior intact while preserving DOM-first hero content.
  - Rebalanced hero overlay opacity progression in `HeroSection` to reveal more of the revised scene while keeping CTA readability.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Run a visual baseline refresh (`cmd /c npm run test:visual:update`) once this look direction is approved.
  - Optional follow-up: fine-tune portal halo/rim intensity from side-by-side reference stills.

## 2026-02-26
- Milestones touched: tooling support (image generation workflow reliability).
- Skills used (or "none"): `imagegen`.
- Completed:
  - Added repo-local launcher `scripts/image_gen.py` so the documented skill command path now works in this repository.
  - Wired launcher fallback resolution to both local skill path (`.agents/skills/imagegen/scripts/image_gen.py`) and global Codex skill path (`~/.codex/skills/imagegen/scripts/image_gen.py`).
  - Updated `SETUP.md` with explicit Python dependency install and imagegen health-check command.
  - Installed missing Python dependency `openai` (Pillow already present) in this environment.
- Validation run:
  - `python scripts/image_gen.py --help`
  - `python scripts/image_gen.py generate --prompt "health check" --dry-run`
  - `python -c "import importlib.util; print(bool(importlib.util.find_spec('openai')))"` (returns `True`)
- Remaining / next:
  - Set `OPENAI_API_KEY` in your shell to enable live generations (dry-run already works).

## 2026-02-26
- Milestones touched: 1-2 (hero tunnel-end stadium crowd pass).
- Skills used (or "none"): `threejs-textures` (`imagegen` intentionally skipped: `OPENAI_API_KEY` not set for live generation).
- Completed:
  - Added free-use source crowd photo into `Assets/free-open/downloads/stadium_crowd_pixabay_3638371_1280.jpg` and logged provenance in `Assets/free-open/SOURCES.md`.
  - Generated graded runtime crowd plates (`2k` + `1k`) at `src/assets/textures/hero/stadium_crowd_plate*.webp` with matching source-derived copies under `Assets/free-open/generated/textures/hero/`.
  - Extended `src/three/assets/assetManifest.ts` with new `stadium_crowd_plate` texture key.
  - Updated `HeroScene` tunnel-exit stack to render the crowd plate with beat-driven reveal opacity so the portal resolves into a visible stadium audience instead of flat color bars.
  - Regenerated `Assets.json` after asset additions.
- Validation run:
  - `powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - `cmd /c npm run test:visual`
- Remaining / next:
  - Tune crowd plane crop/grade against your preferred reference still (warmer vs cooler, more/less blur).
  - If desired, replace with a custom generated crowd plate once `OPENAI_API_KEY` is available.

## 2026-02-26
- Milestones touched: 1-2 (hero visual direction correction).
- Skills used (or "none"): `threejs-lighting`, `threejs-textures`, `threejs-postprocessing`.
- Completed:
  - Reworked Hero opening palette and scene composition to match warm tunnel reference more closely.
  - Increased atmospheric treatment (dust readability, haze warmth, bloom/contrast envelope).
  - Added stronger stadium-exit read (warm portal, horizon light band, pitch hint planes).
  - Reduced hero overlay dominance and shifted hero typography/CTA treatment to warmer grading so the 3D opening reads first.
  - Updated visual baselines after look changes.
- Validation run:
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - `cmd /c npm run test:visual:update`
- Remaining / next:
  - If needed, do one more art pass to push overlay even lighter and expose more central tunnel in first paint.

## 2026-02-26
- Milestones touched: 2.5 (curated free-asset replacement pass).
- Skills used (or "none"): `threejs-textures`.
- Completed:
  - Replaced first-pass synthetic tunnel maps with curated ambientCG CC0 material packs:
    - `Concrete013` (tunnel wall set, 2k + 1k)
    - `Concrete047A` (tunnel floor set, 2k + 1k)
  - Upgraded `scripts/fetch-free-polish-assets.py` to fetch ambientCG packs via `ambientcg.com/get` and extract canonical map sets from ZIP archives.
  - Replaced several generated placeholders with curated free source-driven derivatives (smoke/sprite/noise/lensflare/caustic from Three.js examples):
    - dust sprites, glow sprite, confetti atlas, light streak, film grain, haze plates, and grime atlas.
  - Switched tunnel HDR source to `san_giuseppe_bridge_2k.hdr` and kept transition HDR from `venice_sunset_1k.hdr`.
  - Regenerated `Assets.json` after new source additions.
- Validation run:
  - `python scripts/fetch-free-polish-assets.py`
  - `powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1`
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - `cmd /c npm run test:visual:update`
- Remaining / next:
  - Run visual regression snapshot refresh (`cmd /c npm run test:visual:update`) and compare deltas before sign-off.
  - Optionally curate a second ambientCG/Poly-Haven HDR pair if you want a different mood target.

## 2026-02-26
- Milestones touched: 2.5 (free/open asset sourcing and runtime population).
- Skills used (or "none"): `threejs-textures`.
- Completed:
  - Added repeatable fetch/generate pipeline script: `scripts/fetch-free-polish-assets.py`.
  - Downloaded free/open source textures, sprites, and HDRIs from the Three.js examples texture library into `Assets/free-open/downloads/`.
  - Generated derivative runtime-ready hero/transition assets (PBR maps, overlays, masks, LUT, sprites) and stored source copies under `Assets/free-open/generated/`.
  - Populated `src/assets/` with runtime files matching the manifest keys, including tunnel/floor texture sets and `_1k` variants used by low/mid profiles.
  - Added source/license traceability note at `Assets/free-open/SOURCES.md`.
  - Regenerated `Assets.json` after asset additions.
- Validation run:
  - `python scripts/fetch-free-polish-assets.py`
  - `powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Review the newly sourced art direction in-browser and replace any placeholder/generated assets that do not meet final quality bar.
  - Optionally move runtime asset URLs to bundled imports (instead of `/src/...` paths) for stricter production-path reliability.

## 2026-02-26
- Milestones touched: 2.5 (asset catalog update).
- Skills used (or "none"): none.
- Completed:
  - Added `Assets/42870aad-d83e-433d-9283-11a8b0016ef3.png` to canonical catalog.
  - Regenerated `Assets.json` using `scripts/generate-assets-json.ps1`.
  - Confirmed the new entry is tagged as `reference` and included in `lookup.miscReference`.
- Validation run:
  - `powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1`
- Remaining / next:
  - Continue sourcing and adding remaining free/open hero-transition polish assets listed in the asset manifest.

## 2026-02-26
- Milestones touched: 1-2 (Polish V2 pass), 2.5 (new completion section).
- Skills used (or "none"): `gsap-scrolltrigger`, `threejs-lighting`, `threejs-textures`, `threejs-postprocessing`.
- Completed:
  - Added beat/spec + quality envelope config files (`src/config/heroTransitionBeats.ts`, `src/config/visualProfiles.ts`).
  - Extended `useDeviceTier` with `allowPostFx`, `textureSet`, and `particleCap`.
  - Added typed runtime asset manifest (`src/three/assets/assetManifest.ts`) and optional texture loader hook.
  - Refactored `HeroScene` and `TransitionScene` to consume `visualProfile` and beat-driven choreography.
  - Added post-processing wrapper `ScenePostFx` and wired desktop/high-tier gating in `PageShell`.
  - Added DOM beat metadata (`data-hero-beat`, `data-transition-beat`) and overlay polish in Hero/Transition sections.
  - Added runtime asset structure under `src/assets/` with placeholders and onboarding checklist.
  - Added visual regression suite scaffold (`tests/visual/hero-transition.visual.spec.ts`) and npm scripts for visual snapshot workflows.
  - Expanded smoke coverage for beat progression and explicit post-FX disabled behavior in reduced-motion/mobile paths.
  - Marked new Milestone 2.5 polish checklist complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Add free/open hero/transition runtime assets from the manifest list and regenerate `Assets.json`.
  - Capture baseline visual snapshots with `cmd /c npm run test:visual:update`.
  - Run visual/perf sign-off pass before enabling polish flag by default in production.

## 2026-02-26
- Milestones touched: 4 (Slice C implementation + milestone acceptance sign-off).
- Skills used (or "none"): `gsap-scrolltrigger`.
- Completed:
  - Added non-reduced-motion staggered entry reveal for featured story cards in `FeaturedStoriesSection`.
  - Added touch/pointer highlight parity and explicit section reveal mode markers (`data-entry-motion`, `data-entry-reveal`).
  - Improved keyboard visibility with stronger featured card focus-within outline treatment.
  - Enforced reduced-motion static reveal path for featured cards (no entry tween, no card lift on hover/focus).
  - Expanded smoke coverage for sequential keyboard focus order and reduced-motion static reveal assertions.
  - Marked Milestone 4 Slice C and acceptance criteria complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Start Milestone 5 Slice A (`networkShows.json` + DOM tile grid + placeholder loading state).

## 2026-02-25
- Milestones touched: 4 (Slice A + Slice B implementation).
- Skills used (or "none"): `gsap-scrolltrigger`, `threejs-fundamentals`.
- Completed:
  - Added featured stories data source (`src/data/featuredStories.json`, `src/data/featuredStories.ts`).
  - Implemented `FeaturedStoriesSection` with DOM-first story cards, categories, and `Read Story` CTAs.
  - Wired section into `PageShell` and promoted placeholder handoff to Milestone 5.
  - Implemented `FeaturedStoriesScene` constellation atmosphere with low-cost points/lines.
  - Synced hover/focus card highlight state to scene emphasis and added low-tier static fallback.
  - Expanded smoke tests for featured card rendering, CTA routes, highlight state, and updated handoff expectation.
  - Marked Milestone 4 Slice A/B checklist items complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Milestone 4 Slice C: add reduced-motion-safe entry reveals and final accessibility polish checks.
  - Milestone 4 acceptance sign-off sweep (readability, interaction consistency, mobile targeting).

## 2026-02-25
- Milestones touched: 3 (acceptance sign-off + asset inclusion).
- Skills used (or "none"): `playwright`.
- Completed:
  - Included new `Assets/*.webp` and `.glb` files and regenerated `Assets.json`.
  - Ran full sequential sign-off checks for Milestone 3.
  - Marked Milestone 3 acceptance criteria complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Commit and push Milestone 3 implementation.
  - Start Milestone 4 Slice A (`featuredStories.json` + section scaffold).

## 2026-02-25
- Milestones touched: 3 (Slice C implementation).
- Skills used (or "none"): `gsap-scrolltrigger`, `threejs-fundamentals`.
- Completed:
  - Expanded `tourStops` data with short teaser content and typed field support.
  - Added panel CTA link "See Local Guide" with placeholder internal route (`/guides/:slug`).
  - Updated tour panel to show city, venue, date, and teaser copy.
  - Finalized reduced-motion fallback by disabling scroll-driven stop scrubbing and route draw scrubbing.
  - Updated smoke tests to assert CTA visibility and placeholder route changes with stop selection.
  - Marked Milestone 3 Slice C tasks complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
  - `cmd /c npm run lint`
  - Note: initial lint run was executed in parallel with smoke tests and failed due a transient `test-results` directory race; sequential rerun passed.
- Remaining / next:
  - Milestone 3 acceptance sign-off sweep (manual visual QA for smooth pinning/readability).
  - Start Milestone 4 Slice A (`featuredStories.json` + DOM discovery cards scaffold).

## 2026-02-25
- Milestones touched: 3 (Slice B implementation).
- Skills used (or "none"): `gsap-scrolltrigger`, `threejs-fundamentals`.
- Completed:
  - Added shared tour projection utilities in `src/data/tourMapProjection.ts`.
  - Upgraded `TourStopsSection` with clickable map pins plus chip interactions.
  - Synced ScrollTrigger progress to active stop state and chip/pin selections.
  - Added scroll-jump behavior when selecting a stop chip/pin.
  - Implemented route line draw progression in `TourStopsScene` tied to scroll/selection.
  - Expanded smoke coverage for pin/chip synchronization behavior.
  - Marked Milestone 3 Slice B checklist items complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Milestone 3 Slice C: add "See Local Guide" CTA, panel refinement, and finalize reduced-motion map simplification.
  - Add smoke assertion for Slice C CTA visibility.

## 2026-02-25
- Milestones touched: 3 (Slice A implementation).
- Skills used (or "none"): `gsap-scrolltrigger`, `threejs-fundamentals`.
- Completed:
  - Added `src/data/tourStops.json` plus typed loader `src/data/tourStops.ts`.
  - Implemented pinned `TourStopsSection` with DOM-first panel shell and stop chips.
  - Implemented placeholder `TourStopsScene` with map plane and projected pin anchors.
  - Wired shared canvas scene flow to include Tour Stops and active stop state in `PageShell`.
  - Updated placeholder handoff section to Milestone 4 and aligned smoke tests.
  - Marked Milestone 3 Slice A checklist items complete in `MILESTONES.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Milestone 3 Slice B: sync pin/chip interaction with scroll state and add route line draw.
  - Milestone 3 Slice C: add "See Local Guide" CTA and finalize reduced-motion map behavior.

## 2026-02-25
- Milestones touched: 3-7 planning.
- Skills used (or "none"): none (planning/doc update only).
- Completed:
  - Expanded milestone plan for the next five milestones (3: Tour Stops, 4: Featured Stories, 5: Network Wall, 6: Host Spotlight, 7: Matchweek Timeline).
  - Added per-milestone scope, vertical slices, acceptance criteria, and cross-milestone exit gates.
  - Preserved alignment with DOM-first content, reduced-motion paths, and mobile/performance fallbacks.
- Validation run:
  - Not run (documentation-only update).
- Remaining / next:
  - Review milestone sequencing and adjust day ranges based on team capacity.
  - Start Milestone 3 Slice A (`tourStops.json` + section scaffold + map anchors).

## 2026-02-25
- Milestones touched: 0-2 audit + planning for next phase.
- Skills used: `playwright` (smoke validation).
- Completed:
  - Audited source-of-truth docs and current implementation.
  - Verified local quality gates pass (`lint`, `build`, smoke tests).
  - Identified near-term risks: no commit baseline yet, bundle size warning, reduced-motion transition still ramps.
  - Added process guardrails so progress tracking is explicit in `AGENTS.md`.
- Validation run:
  - `cmd /c npm run lint`
  - `cmd /c npm run build`
  - `cmd /c npm run test:smoke`
- Remaining / next:
  - Create initial git baseline commit.
  - Run `web-design-guidelines` + `web-perf` checks as Milestone 2.5 stabilization.
  - Start Milestone 3 vertical slice A (map scaffold + `tourStops.json` + panel).
