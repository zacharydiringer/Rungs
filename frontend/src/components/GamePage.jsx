import { useState, useEffect, useRef, useCallback } from "react";
import { s, C } from "../styles/theme";
import { fmtTime, formatDisplayDate } from "../utils/dateUtils";
import { areAdjacent, swapCells, isSolved, calcEfficiency } from "../utils/gameUtils";
import { saveState } from "../utils/storage";
import { todayStr } from "../utils/dateUtils";

export default function GamePage({ puzzle, gameState, setGameState }) {
  const [selected, setSelected]         = useState(null);
  const [flashIdx, setFlashIdx]         = useState(null);
  const [invalidIdx, setInvalidIdx]     = useState(null);
  const timerRef                         = useRef(null);

  const { board, swaps, elapsed, solved } = gameState;
  const today = todayStr();

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (solved) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.solved) { clearInterval(timerRef.current); return prev; }
        const next = { ...prev, elapsed: prev.elapsed + 1 };
        saveState(today, next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [solved]);

  // ── Tile interaction ─────────────────────────────────────────────────────
  const handleTileClick = useCallback((idx) => {
    if (solved) return;

    if (selected === null) {
      setSelected(idx);
      return;
    }
    if (selected === idx) {
      setSelected(null);
      return;
    }

    if (areAdjacent(selected, idx)) {
      const newBoard  = swapCells(board, selected, idx);
      const newSwaps  = swaps + 1;
      const newSolved = isSolved(newBoard);

      setFlashIdx(idx);
      setTimeout(() => setFlashIdx(null), 300);

      const next = { board: newBoard, swaps: newSwaps, elapsed, solved: newSolved };
      setGameState(next);
      saveState(today, next);
      setSelected(null);
    } else {
      setInvalidIdx(idx);
      setTimeout(() => setInvalidIdx(null), 400);
      setSelected(idx);
    }
  }, [selected, board, swaps, elapsed, solved, today]);

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!puzzle) return (
    <div style={s.page}>
      <div style={{ ...s.card, textAlign: "center" }}>
        <p style={s.p}>No puzzle available for today.</p>
      </div>
    </div>
  );

  const efficiency = calcEfficiency(swaps, puzzle.min_swaps);

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 20,
        }}>
          <div>
            <h2 style={{ ...s.h2, marginBottom: 4 }}>Today's Puzzle</h2>
            <span style={s.chip("blue")}>
              {formatDisplayDate(puzzle.date)} · Par {puzzle.min_swaps}
            </span>
          </div>
          <Timer elapsed={elapsed} solved={solved} />
        </div>

        {/* ── Board ────────────────────────────────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, marginBottom: 8, padding: 16,
          background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`,
        }}>
          {board.map((num, idx) => (
            <Tile
              key={idx}
              num={num}
              idx={idx}
              selected={selected}
              solved={solved}
              flashIdx={flashIdx}
              invalidIdx={invalidIdx}
              onClick={handleTileClick}
            />
          ))}
        </div>

        {/* ── Row labels ───────────────────────────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, paddingLeft: 16, paddingRight: 16, marginBottom: 20,
        }}>
          {[[1,2],[3,4],[5,6],[7,8]].map(([a, b], i) => (
            <div key={i} style={{
              fontSize: 11, color: C.muted, textAlign: "center",
            }}>
              Goal: [{a}, {b}]
            </div>
          ))}
        </div>

        {/* ── Swap counter ─────────────────────────────────────────────── */}
        <SwapBar swaps={swaps} par={puzzle.min_swaps} />

        {/* ── Hint ─────────────────────────────────────────────────────── */}
        {!solved && (
          <p style={{
            fontSize: 13, textAlign: "center", margin: "12px 0 0",
            color: selected !== null ? C.primary : C.muted,
            fontWeight: selected !== null ? 600 : 400,
          }}>
            {selected !== null
              ? "Now tap an adjacent cell to swap ↕↔"
              : "Tap a cell to select it, then tap an adjacent cell to swap"}
          </p>
        )}

        {/* ── Solved banner ─────────────────────────────────────────────── */}
        {solved && (
          <SolvedBanner
            elapsed={elapsed}
            swaps={swaps}
            par={puzzle.min_swaps}
            efficiency={efficiency}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Timer({ elapsed, solved }) {
  return (
    <div style={{
      background: C.bg, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "8px 14px",
      textAlign: "center", minWidth: 72,
    }}>
      <div style={{
        fontSize: 20, fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: solved ? C.accent : C.text,
      }}>
        {fmtTime(elapsed)}
      </div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>TIME</div>
    </div>
  );
}

function Tile({ num, idx, selected, solved, flashIdx, invalidIdx, onClick }) {
  const isSelected = selected === idx;
  const canSwap    = selected !== null && selected !== idx && areAdjacent(selected, idx);
  const isFlash    = flashIdx  === idx;
  const isInvalid  = invalidIdx === idx;

  const bg = solved       ? C.tileGoal
           : isFlash      ? "#cce0ff"
           : isInvalid    ? "#fde8e8"
           : isSelected   ? C.tileSel
           : canSwap      ? C.tileHov
           : C.tileBase;

  const border = isSelected ? `2px solid ${C.primary}`
               : canSwap    ? `2px dashed ${C.primary}`
               : `1.5px solid ${C.border}`;

  return (
    <div
      onClick={() => onClick(idx)}
      style={{
        height: 64, borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 700,
        cursor: solved ? "default" : "pointer",
        userSelect: "none",
        transition: "all 0.15s",
        border, background: bg,
        color: solved ? C.accent : C.text,
        boxShadow: isSelected ? `0 0 0 3px rgba(10,102,194,0.15)` : "none",
        transform: isSelected ? "scale(1.04)" : "scale(1)",
      }}
    >
      {num}
    </div>
  );
}

function SwapBar({ swaps, par }) {
  const overPar = swaps > par;
  const fillPct = Math.min(100, (swaps / (par * 2)) * 100);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>Swaps Used</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: overPar ? C.warn : C.text }}>
          {swaps}{" "}
          <span style={{ color: C.muted, fontWeight: 400 }}>/ par {par}</span>
        </span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, transition: "width 0.3s",
          width: `${fillPct}%`,
          background: overPar ? C.warn : C.accent,
        }} />
      </div>
    </div>
  );
}

function SolvedBanner({ elapsed, swaps, par, efficiency }) {
  const stats = [
    { label: "Time",       value: fmtTime(elapsed) },
    { label: "Swaps",      value: swaps },
    { label: "Par",        value: par },
    { label: "Efficiency", value: `${efficiency}%` },
  ];

  const handleShare = () => {
    const txt = `🪜 Rungs\n⏱ ${fmtTime(elapsed)}  🔄 ${swaps} swaps (par ${par})\n⚡ ${efficiency}% efficient`;
    navigator.clipboard?.writeText(txt).catch(() => {});
  };

  return (
    <div style={{
      background: "#e6f4ea", border: `1.5px solid #a8d5b5`,
      borderRadius: 10, padding: 20, textAlign: "center", marginTop: 16,
    }}>
      <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: C.accent, marginBottom: 4 }}>
        Puzzle Solved!
      </div>
      <div style={{ fontSize: 14, color: C.sub, marginBottom: 16 }}>
        {formatDisplayDate(todayStr())}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{value}</div>
            <div style={{ fontSize: 11, color: C.sub }}>{label}</div>
          </div>
        ))}
      </div>
      <button style={s.btn("outline")} onClick={handleShare}>
        📋 Copy Result
      </button>
    </div>
  );
}