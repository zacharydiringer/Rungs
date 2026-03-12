import { s, C } from "../styles/theme";
import { formatDisplayDate, getDayName } from "../utils/dateUtils";
import { todayStr } from "../utils/dateUtils";

export default function HomePage({ setPage, puzzle, solved }) {
  const today = todayStr();
  const displayDate = formatDisplayDate(today);
  const dayName = puzzle ? getDayName(puzzle.date) : getDayName(today);

  return (
    <div style={s.page}>
      <div style={{ ...s.card, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🪜</div>
        <h1 style={s.h1}>Rungs</h1>
        <p style={{ ...s.p, marginBottom: 24 }}>
          Sort the numbers by swapping adjacent cells.
          <br />
          A new puzzle every day.
        </p>

        <div style={{ marginBottom: 24 }}>
          <span style={s.chip("blue")}>{displayDate}</span>
        </div>

        {puzzle && (
          <div style={{
            background: C.bg,
            borderRadius: 8,
            padding: "12px 20px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-around",
          }}>
            <Stat label="Par" value={puzzle.min_swaps} color={C.primary} />
            <Stat label="Day" value={dayName.slice(0, 3)} color={C.primary} />
            <Stat
              label="Status"
              value={solved ? "✓" : "—"}
              color={solved ? C.accent : C.warn}
            />
          </div>
        )}

        {solved ? (
          <div style={{
            ...s.chip("green"),
            justifyContent: "center",
            padding: "10px 24px",
            fontSize: 15,
          }}>
            ✓ Today's puzzle solved! Come back tomorrow.
          </div>
        ) : (
          <button style={s.btn("primary")} onClick={() => setPage("game")}>
            Play Today's Puzzle →
          </button>
        )}

        <div style={{ marginTop: 16 }}>
          <button style={s.btn("outline")} onClick={() => setPage("rules")}>
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.sub }}>{label}</div>
    </div>
  );
}