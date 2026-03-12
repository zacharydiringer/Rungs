import { s, C } from "../styles/theme";
import { GOAL } from "../constants";

const RULES = [
  { icon: "🔢", title: "The Grid",     desc: "You're given a 4×2 grid with numbers 1–8 in a scrambled order." },
  { icon: "🔄", title: "Make a Swap",  desc: "Select any two adjacent cells (side-by-side or directly above/below) to swap their values." },
  { icon: "🎯", title: "The Goal",     desc: "Arrange so row 1=[1,2], row 2=[3,4], row 3=[5,6], row 4=[7,8]." },
  { icon: "⚡", title: "Fewest Swaps", desc: "Every swap counts. Try to match or beat the par number of swaps for the day." },
  { icon: "📅", title: "Daily Puzzle", desc: "A new puzzle every day. Difficulty increases as the week progresses." },
];

export default function RulesPage({ setPage }) {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={{ ...s.h1, marginBottom: 20 }}>How to Play</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {RULES.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                fontSize: 24, width: 44, height: 44, borderRadius: 10,
                background: C.bg, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                border: `1px solid ${C.border}`,
              }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{r.title}</div>
                <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Goal state mini board */}
        <div style={{
          background: C.bg, borderRadius: 10, padding: 20,
          border: `1px solid ${C.border}`, marginBottom: 24,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: C.sub,
            marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            Goal State
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 6, maxWidth: 140,
          }}>
            {GOAL.map((n, i) => (
              <div key={i} style={{
                background: C.tileGoal,
                border: `1.5px solid #a8d5b5`,
                borderRadius: 8, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 18, color: C.accent,
              }}>
                {n}
              </div>
            ))}
          </div>
        </div>

        <button style={s.btn("primary")} onClick={() => setPage("game")}>
          Start Playing →
        </button>
      </div>
    </div>
  );
}