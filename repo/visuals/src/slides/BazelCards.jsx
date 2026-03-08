import { useState } from "react";

const cards = [
  {
    id: 0, property: "CORRECTNESS", tagline: "Truth, guaranteed.",
    accent: "#00FFB2", bg: "#020D0A", number: "01",
    points: [
      { label: "Hermetic", body: "Every action is sealed — no access to undeclared inputs. The build sees only what you declare." },
      { label: "Reproducible", body: "Same inputs. Same outputs. Always. Across every machine, every time." },
      { label: "Explicit Deps", body: "Nothing is implied. If it's not in the BUILD file, it doesn't exist to the build." },
    ],
  },
  {
    id: 1, property: "SPEED", tagline: "Build less, ship more.",
    accent: "#FF6B35", bg: "#0D0600", number: "02",
    points: [
      { label: "Incremental", body: "Only what changed gets rebuilt. Bazel tracks the graph so you don't have to." },
      { label: "Parallel", body: "Independent actions run simultaneously, saturating every available core." },
      { label: "Remote Cache", body: "If a colleague already built it, you get their artifact. No redundant work." },
      { label: "Remote Exec", body: "Distribute build actions across a fleet of workers. Scale horizontally." },
    ],
  },
  {
    id: 2, property: "SCALABILITY", tagline: "Google-scale, by design.",
    accent: "#A78BFA", bg: "#06030D", number: "03",
    points: [
      { label: "Monorepo-native", body: "Millions of lines. Thousands of targets. One build system to rule them all." },
      { label: "Multi-language", body: "Java, C++, Python, Go, Rust — all in a single dependency graph." },
      { label: "Blaze lineage", body: "Derived from Google's internal Blaze. Battle-tested at the world's largest codebase." },
    ],
  },
  {
    id: 3, property: "EXTENSIBILITY", tagline: "Your rules, your way.",
    accent: "#38BDF8", bg: "#010810", number: "04",
    points: [
      { label: "Starlark DSL", body: "A Python-like language for writing custom build rules and macros that feel native." },
      { label: "Rich Ecosystem", body: "rules_go, rules_python, rules_js and hundreds of community-maintained rulesets." },
    ],
  },
];

export default function BazelCards() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[current];

  const prev = () => { setFlipped(false); setCurrent((c) => (c - 1 + cards.length) % cards.length); };
  const next = () => { setFlipped(false); setCurrent((c) => (c + 1) % cards.length); };

  return (
    <div style={{
      minHeight: "100vh", background: "#050810",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", padding: "32px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&display=swap');
        .card-wrap { perspective: 1200px; }
        .card-inner {
          width: 360px; height: 520px;
          transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1);
          transform-style: preserve-3d; position: relative; cursor: pointer;
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 16px; overflow: hidden; }
        .back { transform: rotateY(180deg); }
        .nav-btn {
          background: none; border: 1px solid #1E2D45; border-radius: 4px;
          color: #4A5568; font-family: 'DM Mono', monospace; font-size: 12px;
          padding: 8px 18px; cursor: pointer; letter-spacing: 2px; transition: all 0.2s;
        }
        .nav-btn:hover { border-color: #4A5568; color: #94A3B8; }
        .dot { width: 6px; height: 6px; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
      `}</style>

      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 5, color: "#2D3F55", marginBottom: 6 }}>BUILD SYSTEM</div>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, letterSpacing: 6,
          background: `linear-gradient(135deg, ${card.accent}, #ffffff80)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", transition: "background 0.5s",
        }}>BAZEL</div>
      </div>

      <div className="card-wrap">
        <div className={`card-inner ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
          <div className="face front" style={{ background: card.bg, border: `1px solid ${card.accent}25` }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }} />
            <div style={{ position: "absolute", right: 20, top: 16, fontFamily: "'Playfair Display', serif", fontSize: 80, fontWeight: 900, color: `${card.accent}08`, lineHeight: 1, userSelect: "none" }}>{card.number}</div>
            <div style={{ padding: "32px 32px 28px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 4, color: `${card.accent}90`, marginBottom: 20 }}>{card.number} / 04</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, lineHeight: 1.1, color: "#F0F4F8", marginBottom: 12, letterSpacing: 1 }}>{card.property}</div>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 16, color: card.accent, fontStyle: "italic", marginBottom: 40, letterSpacing: 0.5 }}>{card.tagline}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {card.points.map((p) => (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${card.accent}, transparent)` }} />
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, color: "#4A5568" }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 3, color: "#1E2D45" }}>TAP TO REVEAL</div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, borderTop: `1px solid ${card.accent}20`, borderLeft: `1px solid ${card.accent}20`, borderTopLeftRadius: 4 }} />
          </div>

          <div className="face back" style={{ background: card.bg, border: `1px solid ${card.accent}25` }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }} />
            <div style={{ padding: "28px 28px 20px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 4, color: `${card.accent}70`, marginBottom: 16 }}>{card.property}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {card.points.map((p) => (
                  <div key={p.label} style={{ display: "flex", gap: 14 }}>
                    <div style={{ width: 2, flexShrink: 0, background: `linear-gradient(180deg, ${card.accent}, transparent)`, borderRadius: 2 }} />
                    <div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: card.accent, marginBottom: 4 }}>{p.label}</div>
                      <div style={{ fontFamily: "'Georgia', serif", fontSize: 13, color: "#94A3B8", lineHeight: 1.65 }}>{p.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 3, color: "#1E2D45" }}>TAP TO FLIP BACK</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 32 }}>
        <button className="nav-btn" onClick={prev}>← PREV</button>
        <div style={{ display: "flex", gap: 8 }}>
          {cards.map((c, i) => (
            <div key={i} className="dot" onClick={() => { setFlipped(false); setCurrent(i); }}
              style={{ background: i === current ? card.accent : "#1E2D45", boxShadow: i === current ? `0 0 8px ${card.accent}` : "none" }} />
          ))}
        </div>
        <button className="nav-btn" onClick={next}>NEXT →</button>
      </div>
    </div>
  );
}
