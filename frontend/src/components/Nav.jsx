import { s, C } from "../styles/theme";

export default function Nav({ page, setPage }) {
  return (
    <nav style={s.nav}>
      <span style={s.navLogo} onClick={() => setPage("home")}>
        🪜 Rungs
      </span>
      <div style={s.navLinks}>
        {["home", "rules", "game"].map((p) => (
          <button
            key={p}
            style={s.navBtn(page === p)}
            onClick={() => setPage(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
    </nav>
  );
}