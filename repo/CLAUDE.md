# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Bazel training repository with two areas:
- **`visuals/`** — React 18 presentation (CRA) with interactive slides teaching Bazel & Zephyr/pw_kernel concepts
- **`prompts/`** — Reusable AI prompts for slide modifications

> `exercises/` is referenced in docs but does not exist yet.

## Repository Structure

```
repo/
├── visuals/              ← React app (presentation)
│   ├── src/App.jsx       ← Slide orchestrator: track-based nav, arrow keys, nav bar
│   ├── src/index.jsx     ← React 18 root.render
│   ├── src/slides/       ← One component per slide (16 total)
│   ├── public/index.html ← Minimal dark-theme shell
│   └── package.json      ← React 18 + CRA + gh-pages
├── prompts/              ← AI task prompts
├── concepts.md           ← Bazel/Bzlmod conceptual diagram
└── CLAUDE.md             ← This file
```

## Commands

All commands run from `visuals/`:

- `npm install` — install dependencies
- `npm start` — dev server on http://localhost:3000
- `npm run build` — production build to `visuals/build/`
- `npm run deploy` — build + deploy to GitHub Pages

No test runner or linter is configured.

## Architecture

### Navigation

`App.jsx` uses **track-based** navigation (not a flat slide array):
- Two tracks: `bazel` (8 slides) and `kernel` (7 slides)
- **MasterSlide** is the hub (shown when no track is selected)
- State: `track` (null | "bazel" | "kernel") + `current` (0-indexed)
- Arrow keys / nav bar / HOME to navigate; Escape returns to master

### Slide Conventions

Every slide is a **standalone functional component with no props** (except MasterSlide).

- All styling is **inline** via `style` props — no CSS files, no className
- State lives inside the slide (`useState`) — no prop drilling / context / Redux
- `minHeight: "100vh"`, `background: "#080C14"`, `fontFamily: "'Courier New', monospace"`
- Color palette: bg `#080C14`, text `#E2E8F0`, dim `#64748B`, bazel `#00FFB2`, kernel `#A78BFA`, rust `#CE422B`, info `#38BDF8`

### Adding a slide

1. Create `visuals/src/slides/YourSlide.jsx` — export default functional component
2. Import in `visuals/src/App.jsx`
3. Add `{ id, label, component }` to the appropriate track in `tracks`
