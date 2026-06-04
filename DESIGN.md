# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-06-04
- Primary product surfaces: Static portfolio homepage, guided tour, featured case studies, repo atlas, demo shelf, experience timeline.
- Evidence reviewed: `index.html`, `css/styles.css`, `scss/styles.scss`, `js/scripts.js`, `package.json`, `_portfolio-rehab/repo-inventory.json`, GitHub API inventory for 63 public repos, and parallel repo/design scan summaries.

## Brand
- Personality: Working lab notebook meets arcade cabinet: practical, curious, builder-led, and a little playful.
- Trust signals: Clear repo count, direct GitHub links, live demo badges, stack chips, verification/readiness notes, and honest archive labels for older projects.
- Avoid: Generic resume-template copy, flat lists of repo names, corporate polish that hides experimental work, and overclaiming live readiness for hardware-gated or legacy projects.

## Product goals
- Goals: Help visitors understand Manny Bhidya's body of work quickly, route them to runnable demos, and explain how older learning artifacts connect to newer product/game/system work.
- Non-goals: Replace GitHub, deeply document every repo inline, or force every old project into a featured case study.
- Success signals: Visitor can pick a path in one screen, find live demos without parsing GitHub, and understand why each featured project matters.

## Personas and jobs
- Primary personas: Hiring managers, technical interviewers, collaborators, and future maintainers reviewing the repo archive.
- User jobs: Browse highlights, inspect engineering depth, play demos, understand technical range, and jump into source code.
- Key contexts of use: Desktop review during interviews, quick mobile scan from a resume link, and deeper project walkthrough before a conversation.

## Information architecture
- Primary navigation: Tour, Case Studies, Repo Atlas, Demos, Experience.
- Core routes/screens: Single-page static site with anchor sections and client-rendered repo data.
- Content hierarchy: Hero stats and CTAs first; guided tour second; six curated case studies third; searchable/filterable repo atlas fourth; demo taxonomy fifth; experience timeline last.

## Design principles
- Make the archive legible: Group 63 repos into categories and roles before exposing the full list.
- Be honest about readiness: Separate live, static-safe, multi-device, hardware-gated, script/install, and narrated demos.
- Tradeoffs: Keep the current static serverless repo for deployment simplicity, even though a future Vite rewrite would make generated routes and visual testing cleaner.

## Visual language
- Color: Dark ink canvas, off-white text, muted steel panels, brass highlights, acid-cyan links, and restrained warning/status colors.
- Typography: Existing Lato can stay for low-risk continuity; use tighter hierarchy and smaller card headings for dense repo content.
- Spacing/layout rhythm: Full-width bands with constrained inner content; dense but readable grids.
- Shape/radius/elevation: Cards at 6-8px radius, subtle borders, minimal shadow.
- Motion: Smooth anchor scrolling and light card/filter transitions only.
- Imagery/iconography: Prefer repo screenshots/assets where available; otherwise use category badges and stack chips rather than decorative illustrations.

## Components
- Existing components to reuse: Header anchors, hero, project section structure, experience timeline, footer social links.
- New/changed components: Stat strip, guided tour stops, case-study panels, repo filter chips, repo cards, demo shelf rows.
- Variants and states: Featured, interactive demo, supporting project, archive/reference; empty search state; live/static/hardware/narrated demo badges.
- Token/component ownership: `css/styles.css` owns shipped styles for this pass; `scss/styles.scss` is legacy source until the old Gulp/Sass toolchain is modernized.

## Accessibility
- Target standard: WCAG-aware static portfolio with semantic headings, keyboard-reachable filters/links, visible focus, and readable contrast.
- Keyboard/focus behavior: Filter buttons must be actual buttons and preserve focus styles.
- Contrast/readability: Avoid low-contrast gray text on dark backgrounds; keep repo cards scannable.
- Screen-reader semantics: Use sections with headings, list structures for cards, and descriptive link text.
- Reduced motion and sensory considerations: No essential motion; filtering should not rely on animation.

## Responsive behavior
- Supported breakpoints/devices: Mobile portrait through desktop review screens.
- Layout adaptations: Hero stats and filters wrap; case studies collapse to one column; repo cards use fluid grid tracks.
- Touch/hover differences: Hover effects are decorative only; all commands are visible and tappable.

## Interaction states
- Loading: Repo atlas can render from embedded/generated JSON immediately; if fetch fails, show a concise fallback.
- Empty: Show "No repos match these filters" with reset action.
- Error: Keep static curated content visible even if generated data fails.
- Success: Filter chips update counts and visible cards without layout jumps.
- Disabled: Avoid disabled controls unless a filter has no matches.
- Offline/slow network: Core content should work from static files after first load.

## Content voice
- Tone: Direct, specific, and builder-focused.
- Terminology: Use "case study", "repo atlas", "demo shelf", "archive", and "walkthrough" consistently.
- Microcopy rules: Say what a repo does and how to try it; avoid unexplained acronyms in card titles.

## Implementation constraints
- Framework/styling system: Existing static HTML, CSS, JavaScript, Bootstrap grid, Font Awesome, and jQuery. No framework migration in this pass.
- Design-token constraints: Prefer direct CSS variables in `css/styles.css`; keep old Sass untouched unless the build chain is modernized.
- Performance constraints: Data file should be small enough for GitHub Pages; render cards client-side without heavy dependencies.
- Compatibility constraints: Must run as a serverless static site on GitHub Pages/Vercel-style hosting.
- Test/screenshot expectations: Verify generated data, static rendering, filtering behavior, responsive layout, and no console-breaking JavaScript.

## Open questions
- [ ] Current professional title and updated bio / owner: Manny / impact: hero and About section accuracy.
- [ ] Preferred featured project order / owner: Manny / impact: case-study emphasis.
- [ ] Which older risky automation/security repos should be hidden from the public atlas / owner: Manny / impact: portfolio risk posture.
