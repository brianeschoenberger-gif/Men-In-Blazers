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
