# Bazel Training

A training repository for learning Bazel build system fundamentals. Contains interactive visual materials and hands-on exercises.

## Structure

```
visuals/    — React presentation with interactive slides
exercises/  — Hands-on Bazel exercises
```

## Visuals (Presentation)

An interactive slide deck built with React.

### Slides

1. **Intro** — Title & agenda
2. **Properties** — Interactive diagram of Bazel's core properties (click to expand)
3. **Flashcards** — Flip cards for each property with detailed explanations
4. **Rust + Bazel** — Rust integration with Bazel

### Running the presentation

```bash
cd visuals
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Navigation

- **Arrow keys** (← →) to move between slides
- **Click** the nav bar at the bottom to jump to any slide
- On the Properties slide, **click any card** to expand details
- On the Flashcards slide, **click the card** to flip it, use **PREV / NEXT** to switch topics

## Exercises

Hands-on exercises for practicing Bazel concepts. See [exercises/](exercises/) for details.
