import { NavLink, Outlet } from "react-router-dom";
import { modules } from "@/modules/registry";
import { useProgress, levelFromXp } from "@/shared/progress/useProgress";
import "./app-shell.css";

/**
 * The game HUD frame: a party/quest panel on the left with an XP bar, plus a
 * link back to the settings/customise page. Modules render into <Outlet/>.
 */
export function AppShell() {
  const { xpFor, level, into, needed, pct } = useProgress();

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <aside className="shell__sidebar panel">
        <NavLink to="/" className="shell__brand pixel">
          <span aria-hidden="true">🌱</span> SocialLearning
        </NavLink>

        {/* Player HUD */}
        <div className="shell__hud">
          <div className="shell__level pixel" aria-label={`Level ${level}`}>
            <span>LV</span>
            <strong>{level}</strong>
          </div>
          <div className="shell__xp">
            <div className="xpbar" aria-hidden="true">
              <div className="xpbar__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="shell__xptext">
              {into} / {needed} XP
            </span>
          </div>
        </div>

        <nav aria-label="Quests" className="shell__nav">
          <NavLink to="/" end className="shell__link">
            <span className="shell__glyph" aria-hidden="true">
              🏠
            </span>
            <span className="shell__linktext">Home</span>
          </NavLink>
          {modules.map((m) => {
            const mlevel = levelFromXp(xpFor(m.id)).level;
            return (
              <NavLink
                key={m.id}
                to={`/learn/${m.id}`}
                className="shell__link"
                style={{ ["--accent" as string]: m.accent }}
              >
                <span className="shell__glyph" aria-hidden="true">
                  {m.glyph}
                </span>
                <span className="shell__linktext">{m.title}</span>
                <span className="shell__badge pixel">Lv.{mlevel}</span>
              </NavLink>
            );
          })}
        </nav>

        <NavLink to="/welcome" className="btn btn--ghost shell__a11y">
          ⚙ Settings
        </NavLink>
      </aside>

      <main id="main" className="shell__main">
        <Outlet />
      </main>
    </div>
  );
}
