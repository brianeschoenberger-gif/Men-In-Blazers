# SKILLS.md

## Purpose
Canonical human-readable skill routing guide for this repository.

## Auto-Update
Regenerate this file and `skills.json` whenever skills change:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-skills-registry.ps1
```

## Skill Selection Rule
- Before substantial implementation or review, select applicable skills from this list.
- Use the minimum set of skills that covers the task.
- If no skill applies, continue with normal engineering workflow.

## Installed Skills

### threejs-loaders
- Name: `threejs-loaders`
- Category: `3d`
- Skill file: `.agents/skills/threejs-loaders/SKILL.md`
- Use when: Three.js asset loading - GLTF, textures, images, models, async patterns. Use when loading 3D models, textures, HDR environments, or managing loading progress.

### threejs-materials
- Name: `threejs-materials`
- Category: `3d`
- Skill file: `.agents/skills/threejs-materials/SKILL.md`
- Use when: Three.js materials - PBR, basic, phong, shader materials, material properties. Use when styling meshes, working with textures, creating custom shaders, or optimizing material performance.

### threejs-interaction
- Name: `threejs-interaction`
- Category: `3d`
- Skill file: `.agents/skills/threejs-interaction/SKILL.md`
- Use when: Three.js interaction - raycasting, controls, mouse/touch input, object selection. Use when handling user input, implementing click detection, adding camera controls, or creating interactive 3D experiences.

### threejs-lighting
- Name: `threejs-lighting`
- Category: `3d`
- Skill file: `.agents/skills/threejs-lighting/SKILL.md`
- Use when: Three.js lighting - light types, shadows, environment lighting. Use when adding lights, configuring shadows, setting up IBL, or optimizing lighting performance.

### threejs-postprocessing
- Name: `threejs-postprocessing`
- Category: `3d`
- Skill file: `.agents/skills/threejs-postprocessing/SKILL.md`
- Use when: Three.js post-processing - EffectComposer, bloom, DOF, screen effects. Use when adding visual effects, color grading, blur, glow, or creating custom screen-space shaders.

### web-design-guidelines
- Name: `web-design-guidelines`
- Category: `design`
- Skill file: `.agents/skills/web-design-guidelines/SKILL.md`
- Use when: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".

### web-perf
- Name: `web-perf`
- Category: `performance`
- Skill file: `.agents/skills/web-perf/SKILL.md`
- Use when: Analyzes web performance using Chrome DevTools MCP. Measures Core Web Vitals (FCP, LCP, TBT, CLS, Speed Index), identifies render-blocking resources, network dependency chains, layout shifts, caching issues, and accessibility gaps. Use when asked to audit, profile, debug, or optimize page load performance, Lighthouse scores, or site speed.

### threejs-shaders
- Name: `threejs-shaders`
- Category: `3d`
- Skill file: `.agents/skills/threejs-shaders/SKILL.md`
- Use when: Three.js shaders - GLSL, ShaderMaterial, uniforms, custom effects. Use when creating custom visual effects, modifying vertices, writing fragment shaders, or extending built-in materials.

### threejs-textures
- Name: `threejs-textures`
- Category: `3d`
- Skill file: `.agents/skills/threejs-textures/SKILL.md`
- Use when: Three.js textures - texture types, UV mapping, environment maps, texture settings. Use when working with images, UV coordinates, cubemaps, HDR environments, or texture optimization.

### neversight-gsap-scrolltrigger
- Name: `gsap-scrolltrigger`
- Category: `general`
- Skill file: `.agents/skills/neversight-gsap-scrolltrigger/SKILL.md`
- Use when: Scroll-based animations using GSAP ScrollTrigger plugin including pinning, scrubbing, snap points, and parallax effects. Use when creating scroll-driven animations, sticky sections, progress indicators, or parallax scrolling experiences.

### playwright
- Name: `playwright`
- Category: `testing`
- Skill file: `.agents/skills/playwright/SKILL.md`
- Use when: Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow debugging) via `playwright-cli` or the bundled wrapper script.

### figma-implement-design
- Name: `figma-implement-design`
- Category: `design`
- Skill file: `.agents/skills/figma-implement-design/SKILL.md`
- Use when: Translate Figma nodes into production-ready code with 1:1 visual fidelity using the Figma MCP workflow (design context, screenshots, assets, and project-convention translation). Trigger when the user provides Figma URLs or node IDs, or asks to implement designs or components that must match Figma specs. Requires a working Figma MCP server connection.

### imagegen
- Name: `imagegen`
- Category: `media`
- Skill file: `.agents/skills/imagegen/SKILL.md`
- Use when: Use when the user asks to generate or edit images via the OpenAI Image API (for example: generate image, edit/inpaint/mask, background removal or replacement, transparent background, product shots, concept art, covers, or batch variants); run the bundled CLI (`scripts/image_gen.py`) and require `OPENAI_API_KEY` for live calls.

### react-best-practices
- Name: `vercel-react-best-practices`
- Category: `performance`
- Skill file: `.agents/skills/react-best-practices/SKILL.md`
- Use when: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.

### threejs-fundamentals
- Name: `threejs-fundamentals`
- Category: `3d`
- Skill file: `.agents/skills/threejs-fundamentals/SKILL.md`
- Use when: Three.js scene setup, cameras, renderer, Object3D hierarchy, coordinate systems. Use when setting up 3D scenes, creating cameras, configuring renderers, managing object hierarchies, or working with transforms.

### threejs-geometry
- Name: `threejs-geometry`
- Category: `3d`
- Skill file: `.agents/skills/threejs-geometry/SKILL.md`
- Use when: Three.js geometry creation - built-in shapes, BufferGeometry, custom geometry, instancing. Use when creating 3D shapes, working with vertices, building custom meshes, or optimizing with instanced rendering.

### screenshot
- Name: `screenshot`
- Category: `media`
- Skill file: `.agents/skills/screenshot/SKILL.md`
- Use when: Use when the user explicitly asks for a desktop or system screenshot (full screen, specific app or window, or a pixel region), or when tool-specific capture capabilities are unavailable and an OS-level capture is needed.

### threejs-animation
- Name: `threejs-animation`
- Category: `3d`
- Skill file: `.agents/skills/threejs-animation/SKILL.md`
- Use when: Three.js animation - keyframe animation, skeletal animation, morph targets, animation mixing. Use when animating objects, playing GLTF animations, creating procedural motion, or blending animations.
