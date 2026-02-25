# MILESTONES.md

## Milestone 0 â€” Project Setup (Day 0â€“1)
- [x] Create Vite + React project (TypeScript preferred)
- [x] Install: three, @react-three/fiber, @react-three/drei, gsap
- [x] Add styling (Tailwind or CSS modules)
- [x] Create folder structure per SPEC.md
- [x] Create Section shell + placeholder sections in correct order
- [x] Create hooks: useReducedMotion, useDeviceTier (basic)

## Milestone 1 â€” Hero â€œTunnel to Pitchâ€ (Day 1â€“3)
- [x] Implement HeroSection with DOM overlay (headline/subhead/CTAs)
- [x] Implement HeroScene:
  - tunnel geo (procedural ok)
  - ceiling light repetition
  - exit portal emissive
  - fog/haze
  - dust particles
- [x] GSAP ScrollTrigger pin + scrub camera push-in
- [x] Desktop mouse drift (small)
- [x] CTA hover + keyboard focus states
- [x] Reduced-motion behavior
- [x] Mobile simplification (lower particles, disable post)

## Milestone 2 â€” Transition â€œCrowd Energy Surgeâ€ (Day 3â€“4)
- [x] Implement TransitionSection
- [x] Implement TransitionScene (or extend HeroScene):
  - energy particles/confetti
  - light streaks
  - waveform line overlays (simple)
- [x] GSAP ScrollTrigger pin + scrub intensity ramp
- [x] Clean end state for handoff to next section
- [x] Reduced-motion + mobile fallback
- [x] Smoke tests cover transition surge/settle, handoff visibility, reduced-motion calm path, and mobile low-tier fallback

## Milestone 3 â€” Tour Stops (Pinned US Map) (Next)
- [ ] Pinned map with pins
- [ ] tourStops.json placeholder (10 stops)
- [ ] Click pin/chip to scrub/jump
- [ ] Route line draw animation
- [ ] Panel + CTA â€œSee Local Guideâ€

## Skill-Gated Workflow
- [ ] Pre-task: choose applicable skills from `SKILLS.md`.
- [ ] Implementation: apply relevant `threejs-*` and React best-practice guidance.
- [ ] Validation: run `playwright` checks for core flows.
- [ ] Review: run `web-design-guidelines` and `web-perf` checks before sign-off.

