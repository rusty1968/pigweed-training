# Copilot Instructions — Bazel Training

## Project Overview

A Bazel training repository with two areas:
- **`visuals/`** — React 18 presentation (Create React App) with interactive slides teaching Bazel & Zephyr/pw_kernel concepts
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
├── prompts/              ← AI task prompts (convert-rustbazel-to-bzlmod.md)
├── concepts.md           ← Bazel/Bzlmod conceptual diagram (ASCII art)
├── CLAUDE.md             ← Guidance for Claude Code
└── package.json          ← Root (gh-pages devDep only)
```

## Commands

All commands run from `visuals/`:

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Dev server at http://localhost:3000 |
| `npm run build` | Production build to `visuals/build/` |
| `npm run deploy` | Build + deploy to GitHub Pages |

No test runner or linter is configured.

## Architecture

### Navigation System

`App.jsx` uses a **track-based** navigation model (not a linear slide array):

```
tracks = {
  bazel:  [ TitleSlide, WhyBazelKernel, KernelBuildAnatomy, LearningRoadmap,
            BazelDiagram, BazelCards, RustBazel, EmbeddedBzlmod ],
  kernel: [ KernelTitleSlide, KernelObjects, ThreadsProcesses,
            ChannelOverview, ChannelSignals, ChannelCode, WaitGroups ]
}
```

- **MasterSlide** is the hub (shown when no track is selected)
- State: `track` (null | "bazel" | "kernel") + `current` (0-indexed slide)
- Arrow keys / nav bar buttons / HOME to navigate; Escape returns to master

### Slide Component Conventions

Every slide is a **standalone functional component with no props** (except MasterSlide which receives `onSelectTrack`).

**Required pattern:**
```jsx
export default function MySlide() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      fontFamily: "'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Content */}
    </div>
  );
}
```

**Styling rules:**
- All styling is **inline** via `style` props — no CSS files, no className, no CSS-in-JS
- Some slides use embedded `<style>` tags for animations (keyframes, 3D transforms)
- No component library — every UI element is custom-built

**Interactivity:**
- State lives inside the slide component (`useState`) — no prop drilling, no context, no Redux
- Three patterns: static text, click-to-expand/flip, multi-tab interfaces

### Color Palette

No centralized color file — use these hardcoded values consistently:

| Token | Hex | Usage |
|-------|-----|-------|
| bg | `#080C14` | Slide background |
| text | `#E2E8F0` | Primary text |
| dim | `#64748B` | Secondary text, captions |
| border | `#1A2235` | Card borders, dividers |
| bazel-accent | `#00FFB2` | Neon green (Bazel) |
| kernel-accent | `#A78BFA` | Purple (kernel topics) |
| rust-accent | `#CE422B` | Rust-colored |
| info | `#38BDF8` | Blue accent |
| warn | `#FF6B35` | Orange accent |

**Common styling patterns:**
- Gradient text: `background: "linear-gradient(135deg, #00FFB2, #38BDF8)"` + `WebkitBackgroundClip: "text"` + `WebkitTextFillColor: "transparent"`
- Dividers: `height: 1` or `2` with gradient background
- Card glow: `boxShadow: "0 0 8px ${color}30"`
- Typography: `'Courier New', monospace` everywhere (some flashcards use Georgia/Playfair Display)

## Adding a Slide

1. Create `visuals/src/slides/YourSlide.jsx` — export default functional component
2. Import in `visuals/src/App.jsx`
3. Add `{ id: "your-id", label: "Label", component: YourSlide }` to the appropriate track in `tracks`
4. Navigation works automatically

## Gotchas

- Colors are **not** in a shared constants file — copy hex values from existing slides
- `exercises/` directory doesn't exist yet despite being referenced in README
- WebkitBackgroundClip gradient text is not universally supported
- Google Fonts are loaded inline in individual slides (not globally)
