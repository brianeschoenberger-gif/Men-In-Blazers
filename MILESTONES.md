# MILESTONES.md

## Planning Assumptions
- Scope is expanded beyond Milestones 0-2 by request.
- Keep hybrid rendering: DOM-first content/CTAs, Three.js for atmosphere.
- Each milestone ships as a smallest vertical slice with desktop, mobile-ish, and reduced-motion validation.

## Milestone 0 - Project Setup (Day 0-1)
- [x] Create Vite + React project (TypeScript preferred)
- [x] Install: three, @react-three/fiber, @react-three/drei, gsap
- [x] Add styling (Tailwind or CSS modules)
- [x] Create folder structure per SPEC.md
- [x] Create section shell + placeholder sections in correct order
- [x] Create hooks: useReducedMotion, useDeviceTier (basic)

## Milestone 1 - Hero "Tunnel to Pitch" (Day 1-3)
- [x] Implement HeroSection with DOM overlay (headline/subhead/CTAs)
- [x] Implement HeroScene:
  - tunnel geometry (procedural)
  - ceiling light repetition
  - exit portal emissive
  - fog/haze
  - dust particles
- [x] GSAP ScrollTrigger pin + scrub camera push-in
- [x] Desktop mouse drift (small)
- [x] CTA hover + keyboard focus states
- [x] Reduced-motion behavior
- [x] Mobile simplification (lower particles, disable heavy effects)

## Milestone 2 - Transition "Crowd Energy Surge" (Day 3-4)
- [x] Implement TransitionSection
- [x] Implement TransitionScene:
  - energy particles/confetti
  - light streaks
  - waveform line overlays (simple)
- [x] GSAP ScrollTrigger pin + scrub intensity ramp
- [x] Clean end state for handoff to next section
- [x] Reduced-motion + mobile fallback
- [x] Smoke tests cover transition surge/settle, handoff visibility, reduced-motion calm path, and mobile low-tier fallback

## Milestone 3 - Tour Stops (Pinned US Map) (Day 5-7)
### Scope
- [x] Build pinned US map section with interactive tour stop pins.
- [x] Keep all critical copy, labels, and CTAs in DOM.

### Vertical Slice Plan
- [x] Slice A: Data + section scaffold
  - [x] Add `src/data/tourStops.json` with 10 placeholder stops (`id`, `city`, `venue`, `dateLabel`, `lat`, `lng`, `slug`)
  - [x] Add `TourStopsSection.tsx` with pinned layout + DOM panel shell
  - [x] Add placeholder `TourStopsScene.tsx` with map plane and pin anchors
- [x] Slice B: Interaction + route motion
  - [x] Click pin or chip to focus selected stop
  - [x] GSAP scroll progress and click actions stay in sync
  - [x] Add route line draw animation between ordered stops
- [x] Slice C: Content panel + CTA
  - [x] Implement stop detail panel (city, venue, date, short teaser)
  - [x] Add CTA "See Local Guide" (keyboard/focus-visible compliant)
  - [x] Add reduced-motion fallback (no route draw scrub; fade states only)

### Acceptance Criteria
- [x] Section pins smoothly and does not stutter on mobile-ish viewport
- [x] Selected stop is reflected in both map and DOM panel
- [x] Reduced-motion path preserves content and skips heavy motion
- [x] Smoke tests include map presence, pin selection, and CTA visibility

## Milestone 4 - Featured Stories (Constellation Discovery) (Day 7-9)
### Scope
- [ ] Build discovery section with DOM story cards and subtle atmospheric constellation background.
- [ ] Prioritize readability and keyboard navigation for cards.

### Vertical Slice Plan
- [ ] Slice A: Data + card rail
  - [ ] Add `src/data/featuredStories.json` (6-8 placeholder stories)
  - [ ] Implement DOM card layout with title, dek, category, and "Read Story" CTA
  - [ ] Add responsive layout behavior (desktop grid, mobile stack/rail)
- [ ] Slice B: Constellation atmosphere
  - [ ] Add low-cost background points + connective lines in Three scene
  - [ ] Link hover/focus state to subtle glow pulse in background
  - [ ] Ensure fallback to static background on low tier
- [ ] Slice C: Motion and accessibility polish
  - [ ] Staggered entry animation (non-reduced motion only)
  - [ ] Focus order and visible focus styles across all cards
  - [ ] Reduced-motion path uses static reveal only

### Acceptance Criteria
- [ ] Story cards remain fully readable over visuals
- [ ] Pointer, keyboard, and touch interactions are consistent
- [ ] Mobile layout keeps CTA targets accessible
- [ ] Smoke tests cover card rendering and at least one CTA path

## Milestone 5 - Network Wall (Shows and Channels) (Day 9-11)
### Scope
- [ ] Build media network wall with show tiles and clear watch/listen entry points.
- [ ] Keep tile metadata in DOM for accessibility and SEO.

### Vertical Slice Plan
- [ ] Slice A: Data + tile grid
  - [ ] Add `src/data/networkShows.json` (8-12 placeholder shows)
  - [ ] Implement grid of show tiles with name, format, and CTA
  - [ ] Add skeleton/placeholder state for future CMS wiring
- [ ] Slice B: Filters + interaction
  - [ ] Add simple filter chips (All, Video, Audio, Editorial)
  - [ ] Add keyboard-navigable filter + tile focus behavior
  - [ ] Add subtle hover treatment (lift, border glow, no layout shift)
- [ ] Slice C: Performance + fallback
  - [ ] Lazy-load any non-critical media preview assets
  - [ ] Disable heavy hover effects on mobile or reduced motion
  - [ ] Keep first render stable (no cumulative layout shifts)

### Acceptance Criteria
- [ ] Filter interactions update visible tiles correctly
- [ ] CTAs are reachable by keyboard and touch
- [ ] Section keeps acceptable FPS on low-tier mode
- [ ] Smoke tests cover filter state and CTA visibility

## Milestone 6 - Host Spotlight (Day 11-12)
### Scope
- [ ] Build host spotlight section with editorial tone and conversion CTA.
- [ ] Keep storytelling content primarily DOM with atmospheric background support.

### Vertical Slice Plan
- [ ] Slice A: Spotlight structure
  - [ ] Add `src/data/hosts.json` (3-5 placeholder hosts)
  - [ ] Implement spotlight layout with portrait, bio snippet, and CTA
  - [ ] Add section-level ARIA labels and semantic headings
- [ ] Slice B: Rotation/selection
  - [ ] Add host selector (tabs or chips) with keyboard support
  - [ ] Sync selected host state across visual and content panel
  - [ ] Add subtle transition between host states
- [ ] Slice C: Reliability and fallback
  - [ ] Reduced-motion path uses hard cuts/fades only
  - [ ] Mobile layout supports thumb-friendly selector controls
  - [ ] Ensure no blocking media load for initial paint

### Acceptance Criteria
- [ ] Host selection updates content without layout instability
- [ ] CTA remains visible and high-contrast in all host states
- [ ] Reduced-motion experience is calm and usable
- [ ] Smoke tests cover host switching and CTA visibility

## Milestone 7 - Matchweek Timeline (Pinned Horizontal) (Day 12-14)
### Scope
- [ ] Build pinned horizontal timeline for matchweek narrative progression.
- [ ] Maintain DOM-first timeline labels/cards with 3D ambiance only.

### Vertical Slice Plan
- [ ] Slice A: Timeline data + scaffold
  - [ ] Add `src/data/matchweekTimeline.json` (8-10 placeholder events)
  - [ ] Build horizontal track with event cards and progress indicator
  - [ ] Implement pinning with GSAP ScrollTrigger
- [ ] Slice B: Scroll-linking + controls
  - [ ] Map vertical scroll progress to horizontal track translate
  - [ ] Add jump controls (prev/next) and keyboard shortcuts
  - [ ] Keep URL hash or state mapping optional for deep-link readiness
- [ ] Slice C: Fallbacks + polish
  - [ ] Reduced-motion fallback switches to vertical stacked timeline
  - [ ] Mobile fallback disables long pin and uses snap sections
  - [ ] Add visual state for active event and completion

### Acceptance Criteria
- [ ] Timeline pin and scrub feels smooth at target viewport sizes
- [ ] Active event is always clear and readable
- [ ] Reduced-motion/mobile fallbacks preserve full timeline content
- [ ] Smoke tests cover timeline render, active-state change, and fallback mode

## Cross-Milestone Exit Gates (Apply to 3-7)
- [ ] Pre-task: choose applicable skills from `SKILLS.md` (minimum required set only)
- [ ] Implementation: keep critical text and CTAs in DOM
- [ ] Validation: run `cmd /c npm run lint`, `cmd /c npm run build`, `cmd /c npm run test:smoke`
- [ ] Review: run `web-design-guidelines` and `web-perf` before milestone sign-off
- [ ] Progress: update `PROGRESS.md` with milestone touched, completed work, validation, and next step
