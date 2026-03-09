import { useState, useEffect } from "react";
import MasterSlide from "./slides/MasterSlide";
import TitleSlide from "./slides/TitleSlide";
import WhyBazelKernel from "./slides/WhyBazelKernel";
import KernelBuildAnatomy from "./slides/KernelBuildAnatomy";
import LearningRoadmap from "./slides/LearningRoadmap";
import BazelDiagram from "./slides/BazelDiagram";
import BazelCards from "./slides/BazelCards";
import RustBazel from "./slides/RustBazel";
import EmbeddedBzlmod from "./slides/EmbeddedBzlmod";
import KernelTitleSlide from "./slides/KernelTitleSlide";
import KernelObjects from "./slides/KernelObjects";
import ThreadsProcesses from "./slides/ThreadsProcesses";
import ChannelOverview from "./slides/ChannelOverview";
import ChannelSignals from "./slides/ChannelSignals";
import ChannelCode from "./slides/ChannelCode";
import WaitGroups from "./slides/WaitGroups";

const tracks = {
  bazel: [
    { id: "title", label: "Intro", component: TitleSlide },
    { id: "why-kernel", label: "Why Bazel?", component: WhyBazelKernel },
    { id: "anatomy", label: "Build Anatomy", component: KernelBuildAnatomy },
    { id: "roadmap", label: "Roadmap", component: LearningRoadmap },
    { id: "diagram", label: "Properties", component: BazelDiagram },
    { id: "cards", label: "Flashcards", component: BazelCards },
    { id: "rust", label: "Rust + Bazel", component: RustBazel },
    { id: "embedded", label: "Embedded Bzlmod", component: EmbeddedBzlmod },
  ],
  kernel: [
    { id: "k-title", label: "Intro", component: KernelTitleSlide },
    { id: "k-objects", label: "Objects", component: KernelObjects },
    { id: "k-threads", label: "Threads", component: ThreadsProcesses },
    { id: "ch-overview", label: "Channels", component: ChannelOverview },
    { id: "ch-signals", label: "Signals", component: ChannelSignals },
    { id: "ch-code", label: "Ch. Code", component: ChannelCode },
    { id: "wait-groups", label: "Wait Groups", component: WaitGroups },
  ],
};

export default function App() {
  const [track, setTrack] = useState(null);
  const [current, setCurrent] = useState(0);

  const slides = track ? tracks[track] : [];

  const prev = () => {
    if (current === 0 && track) {
      setTrack(null);
      setCurrent(0);
    } else {
      setCurrent((c) => Math.max(0, c - 1));
    }
  };
  const next = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

  const selectTrack = (t) => {
    setTrack(t);
    setCurrent(0);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
      if (e.key === "Escape" && track) {
        setTrack(null);
        setCurrent(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Master slide (no track selected)
  if (!track) {
    return <MasterSlide onSelectTrack={selectTrack} />;
  }

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
        {/* Back to master */}
        <button onClick={() => { setTrack(null); setCurrent(0); }} style={{
          background: "none", border: "none",
          color: "#64748B", cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          fontSize: 9, letterSpacing: 2, padding: "4px 8px",
          borderRight: "1px solid #1A2235", marginRight: 4,
        }}>HOME</button>

        <button onClick={prev} disabled={current === 0} style={{
          background: "none", border: "none", color: current === 0 ? "#1E2D45" : "#64748B",
          cursor: current === 0 ? "default" : "pointer", fontSize: 16, padding: "0 4px",
        }}>{"\u2190"}</button>

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
        }}>{"\u2192"}</button>

        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2,
          color: "#2D3F55", marginLeft: 4,
        }}>{current + 1}/{slides.length}</div>
      </div>
    </div>
  );
}
