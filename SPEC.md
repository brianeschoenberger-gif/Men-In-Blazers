# SPEC.md

## Stack (Required)
- React + Vite
- React Three Fiber (Three.js)
- GSAP + ScrollTrigger
- DOM overlay for all text/CTAs
- prefers-reduced-motion support

## Rendering Rules (Hard Requirements)
- All critical content (headline, CTAs) MUST be DOM (not WebGL text).
- 3D is decorative/atmospheric only for Milestone 0â€“2.
- Implement reduced-motion mode: disable heavy motion and pinned scrubbing if needed.

## Section Specs (Milestone 1â€“2)

---

# 1) HERO â€” â€œTunnel to Pitchâ€ (Pinned)

### Purpose
Create an emotionally driven opening with a slow cinematic push down a tunnel toward a bright pitch.

### Layout
- Full viewport section (100svh)
- 3D canvas background
- DOM overlay:
  - Logo (optional)
  - Headline
  - Subheadline
  - Primary CTA
  - Secondary CTA

### Scroll Behavior
- **Pinned** section
- Recommended pin duration: **220vh** (tunable 180â€“260vh)
- Scroll progress drives camera dolly:
  - Progress 0.0 â†’ 1.0 maps to camera Z move forward (or along tunnel axis)
  - Use eased mapping (gentle start, stronger mid, gentle end)

### Required Motion Beats (match Sora vibe)
- Start: darkness + subtle light flicker + distant glow
- Mid: dust becomes more visible, light beams become more defined
- End: bright exit portal dominates; tunnel interior still readable (do not blow out everything)

### Interactions
- Desktop-only subtle mouse drift (small amplitude)
- CTA hover microinteraction (glow/lift)
- Keyboard focus styles for CTAs

### 3D Components (MVP)
- Tunnel geometry:
  - Procedural segments OR `tunnel.glb` if available
- Lighting:
  - Repeating ceiling lights (emissive planes or point/spot lights)
  - Strong emissive â€œexit portalâ€ plane at end
- Atmosphere:
  - Fog/haze (Three.js fog or subtle volumetric cheat)
  - Dust particles (sprite particles)

### Postprocessing
- Optional bloom on high-tier desktop only
- Must be disabled on mobile/low-tier

### Reduced Motion
When `prefers-reduced-motion`:
- Disable mouse drift
- Reduce particles heavily or disable
- Replace camera dolly with simpler fade/scale of background
- Keep pinned behavior optional (either shorten pin or disable pin)

### Acceptance Criteria
- Hero pins and scrubs smoothly (no jitter)
- Text overlay remains readable throughout
- CTAs work and are accessible
- Mobile fallback runs smoothly

---

# 2) TRANSITION â€” â€œCrowd Energy Surgeâ€ (Pinned)

### Purpose
Bridge from cinematic tunnel into an energized â€œcontent worldâ€ state.

### Layout
- Separate section immediately after hero
- 3D visuals with minimal UI (optional small label)

### Scroll Behavior
- **Pinned** section
- Recommended pin duration: **120vh** (tunable 80â€“140vh)

### Motion (Scroll-driven intensity ramp)
- Progress 0.0 â†’ 1.0 controls:
  - Light streak density/brightness
  - Confetti/particle intensity
  - Subtle waveform/line overlays
  - Accent color ramp (introduce brand accent here)

### End State
Transition should settle into a calmer ambient look ready for the next section.
(Next section will be Tour Stops map. For now, end with subtle floating points or gentle ambient lights.)

### Reduced Motion
- No intensity ramp; use simple fades and mild background gradient shift.

### Acceptance Criteria
- Transition pins and scrubs smoothly
- Visual continuity from hero (no harsh cut)
- Ends in a calm state ready for next section
- Mobile doesnâ€™t stutter

---

## Implementation Architecture (Required)

### File Structure
src/
  sections/
    HeroSection.tsx
    TransitionSection.tsx
    PlaceholderNextSection.tsx
  three/
    scenes/
      HeroScene.tsx
      TransitionScene.tsx
    effects/
      DustParticles.tsx
      EnergyParticles.tsx
      LightStreaks.tsx
    hooks/
      useReducedMotion.ts
      useDeviceTier.ts
  components/
    layout/
      PageShell.tsx
      Section.tsx
    ui/
      CTAButton.tsx
  styles/
    globals.css

### Canvas Strategy
Prefer **one canvas** shared across sections if feasible.
If using multiple canvases:
- do not overlap
- ensure each unmounts cleanly
- avoid double GPU load

### Performance Rules
- Clamp DPR (e.g., max 1.5 or 2.0)
- Lower particle count on mobile
- Avoid heavy postprocessing except on desktop/high-tier

## Skill-Aware Execution
- Before implementation, review relevant repo-local skills listed in `SKILLS.md`.
- Use `threejs-*` skills for 3D scene/effects decisions.
- Use `vercel-react-best-practices` for React architecture/performance choices.
- Use `web-design-guidelines` for DOM UI/accessibility checks.
- Use `playwright` for interaction/regression checks and `web-perf` for performance validation.

