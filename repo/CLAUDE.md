# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Bazel training repository with two main areas:
- **`visuals/`** — React presentation with interactive slides teaching Bazel concepts
- **`exercises/`** — Hands-on Bazel exercises for trainees

## Repository Structure

```
visuals/          — React app (presentation)
  src/App.jsx     — Slide system: array of {id, label, component}, arrow-key nav
  src/slides/     — One component per slide
  public/         — Static HTML shell
  package.json    — React 18 via Create React App

exercises/        — Bazel exercise files
```

## Commands

### Visuals (React presentation)

All commands run from `visuals/`:

- `npm install` — install dependencies
- `npm start` — dev server on http://localhost:3000
- `npm run build` — production build to `visuals/build/`

No test runner or linter is configured for visuals.

## Visuals Architecture

- **Entry:** `visuals/src/index.jsx` renders `visuals/src/App.jsx`
- **Slide system:** `App.jsx` has a `slides` array. Navigation via state index + arrow keys + bottom nav bar.
- **Slides in `visuals/src/slides/`** — each is a standalone React component (TitleSlide, BazelDiagram, BazelCards, RustBazel)
- **Styling:** all inline via `style` props, no CSS framework or router

### Adding a slide

1. Create `visuals/src/slides/YourSlide.jsx` exporting a default React component
2. Import it in `visuals/src/App.jsx`
3. Add an entry to the `slides` array
