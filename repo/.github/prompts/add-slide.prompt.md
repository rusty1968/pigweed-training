---
description: "Scaffold a new slide component and wire it into the presentation"
agent: "agent"
argument-hint: "Slide topic and which track (bazel or kernel)"
---

Create a new slide for the Bazel training presentation. Follow these steps exactly:

## 1. Create the slide component

Create `visuals/src/slides/<SlideName>.jsx` as a default-exported functional component with **no props**.

Use this skeleton — adapt the content to the requested topic:

```jsx
export default function SlideName() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      {/* Slide content here */}
    </div>
  );
}
```

## 2. Follow these style rules

- **All styling inline** via `style` props — no CSS files, no `className`.
- Use these colors consistently:
  - Background: `#080C14`
  - Text: `#E2E8F0`, dim: `#64748B`, borders: `#1A2235`
  - Bazel accent (green): `#00FFB2`, kernel accent (purple): `#A78BFA`
  - Rust: `#CE422B`, info (blue): `#38BDF8`, warn (orange): `#FF6B35`
- Gradient headings: `background: "linear-gradient(135deg, #00FFB2, #38BDF8)"` with `WebkitBackgroundClip: "text"` and `WebkitTextFillColor: "transparent"`.
- Font: `"'Courier New', monospace"` (default) or serif for flashcard-style content.
- If the slide needs interactivity, use `useState` inside the component — no props, no context.
- For animations, use an embedded `<style>` tag inside the JSX.

## 3. Wire it into App.jsx

In [visuals/src/App.jsx](../../visuals/src/App.jsx):

1. Add an import: `import SlideName from "./slides/SlideName";`
2. Add an entry to the correct track in the `tracks` object:
   ```js
   { id: "kebab-case-id", label: "Short Label", component: SlideName }
   ```
   - Use the **bazel** track for Bazel/build topics, **kernel** track for OS/Zephyr topics.
   - Place the new entry at the position that makes logical sense in the learning flow.

## 4. Verify

Run `npm start` from `visuals/` to confirm the slide renders and navigation works.
