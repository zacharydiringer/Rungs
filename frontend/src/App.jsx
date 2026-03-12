import { useState, useEffect } from "react";
import { s } from "./styles/theme";
import { todayStr } from "./utils/dateUtils";
import { loadState, saveState } from "./utils/storage";
import Nav       from "./components/Nav";
import HomePage  from "./components/HomePage";
import RulesPage from "./components/RulesPage";
import GamePage  from "./components/GamePage";

export default function App() {
  const [page,      setPage]      = useState("home");
  const [puzzle,    setPuzzle]    = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const today = todayStr();

    // Fetch puzzle list and find today's entry
    fetch("/rungs.json")
      .then((r) => r.json())
      .then((puzzles) => {
        // JSON dates are stored as MM-DD-YYYY
        const found = puzzles.find((p) => p.date === today) ?? null;
        setPuzzle(found);

        if (!found) return;

        // Restore or initialise persistent game state
        const saved = loadState(today);
        if (saved) {
          setGameState(saved);
        } else {
          const init = { board: [...found.board], swaps: 0, elapsed: 0, solved: false };
          setGameState(init);
          saveState(today, init);
        }
      })
      .catch((err) => {
        console.error("Failed to load rungs.json:", err);
      });
  }, []);

  if (!gameState) return (
    <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#666", fontSize: 15 }}>Loading…</div>
    </div>
  );

  return (
    <div style={s.app}>
      <Nav page={page} setPage={setPage} />
      {page === "home"  && (
        <HomePage
          setPage={setPage}
          puzzle={puzzle}
          solved={gameState.solved}
        />
      )}
      {page === "rules" && <RulesPage setPage={setPage} />}
      {page === "game"  && (
        <GamePage
          puzzle={puzzle}
          gameState={gameState}
          setGameState={setGameState}
        />
      )}
    </div>
  );
}