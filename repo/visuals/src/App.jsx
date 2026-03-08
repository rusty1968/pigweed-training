import { useState, useEffect } from "react";
import TitleSlide from "./slides/TitleSlide";
import WhyBazelKernel from "./slides/WhyBazelKernel";
import KernelBuildAnatomy from "./slides/KernelBuildAnatomy";
import LearningRoadmap from "./slides/LearningRoadmap";
import BazelDiagram from "./slides/BazelDiagram";
import BazelCards from "./slides/BazelCards";
import RustBazel from "./slides/RustBazel";
import EmbeddedBzlmod from "./slides/EmbeddedBzlmod";

const slides = [
  { id: "title", label: "Intro", component: TitleSlide },
  { id: "why-kernel", label: "Why Bazel?", component: WhyBazelKernel },
  { id: "anatomy", label: "Build Anatomy", component: KernelBuildAnatomy },
  { id: "roadmap", label: "Roadmap", component: LearningRoadmap },
  { id: "diagram", label: "Properties", component: BazelDiagram },
  { id: "cards", label: "Flashcards", component: BazelCards },
  { id: "rust", label: "Rust + Bazel", component: RustBazel },
  { id: "embedded", label: "Embedded Bzlmod", component: EmbeddedBzlmod },
];

export default function App() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const Slide = slides[current].component;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Slide />

      {/* Navigation bar */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 12,
        background: "#0D1320EE", border: "1px solid #1A2235",
        borderRadius: 40, padding: "8px 16px",
        backdropFilter: "blur(8px)", zIndex: 1000,
      }}>
        <button onClick={prev} disabled={current === 0} style={{
          background: "none", border: "none", color: current === 0 ? "#1E2D45" : "#64748B",
          cursor: current === 0 ? "default" : "pointer", fontSize: 16, padding: "0 4px",
        }}>←</button>

        {slides.map((s, i) => (
          <button key={s.id} onClick={() => setCurrent(i)} style={{
            background: "none", border: "none",
            fontFamily: "'Courier New', monospace",
            fontSize: 10, letterSpacing: 2,
            color: i === current ? "#00FFB2" : "#2D3F55",
            cursor: "pointer", padding: "4px 8px",
            borderBottom: i === current ? "1px solid #00FFB2" : "1px solid transparent",
            transition: "all 0.2s",
          }}>{s.label}</button>
        ))}

        <button onClick={next} disabled={current === slides.length - 1} style={{
          background: "none", border: "none",
          color: current === slides.length - 1 ? "#1E2D45" : "#64748B",
          cursor: current === slides.length - 1 ? "default" : "pointer", fontSize: 16, padding: "0 4px",
        }}>→</button>

        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
          color: "#2D3F55", marginLeft: 4,
        }}>{current + 1}/{slides.length}</div>
      </div>
    </div>
  );
}
