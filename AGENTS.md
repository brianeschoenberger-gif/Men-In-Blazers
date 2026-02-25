# AGENTS.md

## Mission
Build a premium, cinematic soccer media homepage with atmospheric Three.js visuals and accessible DOM-first content.

## Scope
Current build scope is Milestones 0-2 only unless explicitly expanded.

## Source of Truth
Apply these files in order:
1. `SPEC.md`
2. `PRODUCT.md`
3. `STORYBOARD_HERO_TRANSITION.md`
4. `ASSETS.md`
5. `MILESTONES.md`
6. `Assets.json`
7. `SKILLS.md`

If instructions conflict, follow `SPEC.md`.

## Hard Requirements
- Use React + Vite + R3F/Three.js + GSAP ScrollTrigger.
- Keep all critical text/CTAs in DOM (not WebGL text).
- Implement reduced-motion and mobile/performance fallbacks.
- Keep visuals readable and performant.

## Skill Directive
- Before substantial implementation, review `SKILLS.md` and select applicable skills.
- Use only the minimum skill set needed for the task.
- If a relevant skill is skipped, state why.

## Skill Registry Files
- Human routing guide: `SKILLS.md`
- Machine-readable registry: `skills.json`
- Regenerate both: `powershell -ExecutionPolicy Bypass -File scripts/sync-skills-registry.ps1`

## Asset Directive
- Resolve sources from `Assets.json` + `Assets/`.
- Regenerate asset catalog after asset changes:
  `powershell -ExecutionPolicy Bypass -File scripts/generate-assets-json.ps1`

## Progress Tracking
- Maintain `PROGRESS.md` as a running log (latest entry first).
- Update `PROGRESS.md` whenever project files change (`src/`, `tests/`, config/docs tied to milestones).
- Each entry must include:
  - Date
  - Milestone items touched
  - Completed work
  - Validation run
  - Remaining checklist / next step

## Workflow
1. Restate milestone items touched.
2. Choose skills from `SKILLS.md`.
3. Implement the smallest vertical slice.
4. Validate desktop + mobile-ish behavior.
5. Verify reduced-motion path.
6. Update `PROGRESS.md` with what changed and what is next.
7. Report completed items and remaining checklist.
