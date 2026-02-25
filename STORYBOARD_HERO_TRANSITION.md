# STORYBOARD_HERO_TRANSITION.md

## Reference
Use the user-provided Sora hero push-in as the look target.
Resolve all references via `Assets.json` (source files live under `Assets/`).
Current local reference assets:
- `Assets/20260225_1243_01kjb7hvpff0wa3y2484cm199p.mp4` (full push-in)
- `Assets/hq720.jpg` (still reference)
- `Assets/20230314_MIB_0198-Working-Splash-2023.webp` (still reference)

## Creative Intent
A slow, cinematic push down a dim tunnel toward a bright pitch. Dust floats. Ceiling lights repeat. The world feels alive but restrained. Then energy blooms into streaks/confetti and resolves into calm ambient points ready for content.

---

## Frame Beats + Scroll Mapping

### HERO (Pinned ~220vh)

**Frame H1 (0–10%) — “Wake in Darkness”**
- Visual: mostly dark tunnel, faint ceiling lights, distant exit glow
- Motion: tiny light flicker, barely-moving dust
- DOM: logo/headline begins to fade in (subtle)
- Notes: keep contrast high for text readability

**Frame H2 (10–30%) — “Title Locks”**
- Visual: tunnel structure clearer; ceiling light rhythm visible
- Motion: text settles into final position; camera begins forward movement
- DOM: CTA buttons appear (staggered, clean)

**Frame H3 (30–60%) — “The Ritual Walk”**
- Visual: steady push-in; dust more noticeable; light beams slightly stronger
- Motion: camera dolly forward is dominant; subtle ambient drift
- Interaction: mouse drift allowed (desktop only, very subtle)

**Frame H4 (60–85%) — “Pitch Pull”**
- Visual: exit glow intensifies; interior still readable; subtle vignette
- Motion: camera accelerates slightly; dust catches more light

**Frame H5 (85–100%) — “Threshold”**
- Visual: near exit; bright portal dominates
- Motion: last push settles; prepare for transition (hint of energy: faint streaks)

---

### TRANSITION (Pinned ~120vh)

**Frame T1 (0–25%) — “Energy Ignition”**
- Visual: tunnel dissolves into abstract stadium energy
- Motion: first light streaks appear; particle count increases slightly

**Frame T2 (25–60%) — “Crowd Surge”**
- Visual: streaks/confetti increase; waveform lines appear
- Motion: intensity ramps with scroll (density/brightness)

**Frame T3 (60–85%) — “Peak + Resolve”**
- Visual: highest energy moment (still premium, not chaotic)
- Motion: begin to reduce chaos; align streak direction toward forward motion

**Frame T4 (85–100%) — “Settle to Ambient”**
- Visual: streaks fade; confetti becomes slow floating points
- Motion: calm ambient state ready for next section (Tour Stops map pins later)

---

## Interaction States (Required)
- CTA hover: subtle glow/lift (DOM)
- Keyboard focus: visible focus ring
- Reduced motion:
  - disable mouse drift
  - reduce/disable particles
  - shorten or disable pinned scrub; use fades
- Mobile:
  - lower particle count
  - disable heavy postprocessing

---

## What matters most to match the reference
1) **Lighting hierarchy**: exit portal brightest; ceiling lights secondary; tunnel surfaces subdued
2) **Atmosphere**: dust + haze sells “cinematic”
3) **Camera pace**: slow, steady, not jittery
4) **Film treatment**: vignette/grain optional but helps a lot
