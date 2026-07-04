import { useNavigate } from "react-router-dom";
import {
  usePrefs,
  type Theme,
  type TextSize,
  type Aesthetic,
} from "@/shared/prefs/usePrefs";
import "./welcome.css";

/*
 * First-run onboarding. Pupils set the experience to suit them before they
 * start: colour, text size, gamey vs plain, motion and easy-read font.
 *
 * Every choice writes to <html> immediately, so this page is its own live
 * preview. Giving learners control of the stimulation level is the core
 * accessibility idea for our ADHD and socially anxious users.
 */

const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: "sky", label: "Sky", swatch: "#4a92da" },
  { id: "meadow", label: "Meadow", swatch: "#4f9d69" },
  { id: "dusk", label: "Dusk", swatch: "#6f5bd0" },
  { id: "ocean", label: "Ocean", swatch: "#2f86b5" },
  { id: "mono", label: "Mono", swatch: "#6f6a60" },
];

const SIZES: { id: TextSize; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

const AESTHETICS: { id: Aesthetic; label: string; hint: string }[] = [
  { id: "pixel", label: "Cosy Pixel", hint: "Playful game look" },
  { id: "plain", label: "Plain & Calm", hint: "Minimal, low-stimulation" },
];

export function Welcome() {
  const { prefs, setPrefs } = usePrefs();
  const navigate = useNavigate();

  function start() {
    setPrefs({ onboarded: true });
    navigate("/");
  }

  return (
    <div className="welcome">
      <div className="welcome__card panel">
        <header className="welcome__head">
          <p className="welcome__eyebrow pixel">🌱 welcome</p>
          <h1>Make it yours</h1>
          <p className="welcome__lede">
            Set things up so learning feels right for you. Change any of this
            later from the settings button. Nothing here is wrong.
          </p>
        </header>

        {/* Colour */}
        <fieldset className="welcome__group">
          <legend className="welcome__legend pixel">Colour</legend>
          <div className="welcome__row">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={"opt opt--swatch" + (prefs.theme === t.id ? " is-on" : "")}
                aria-pressed={prefs.theme === t.id}
                onClick={() => setPrefs({ theme: t.id })}
              >
                <span
                  className="opt__dot"
                  style={{ background: t.swatch }}
                  aria-hidden="true"
                />
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Text size */}
        <fieldset className="welcome__group">
          <legend className="welcome__legend pixel">Text size</legend>
          <div className="welcome__row">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={"opt" + (prefs.textSize === s.id ? " is-on" : "")}
                aria-pressed={prefs.textSize === s.id}
                onClick={() => setPrefs({ textSize: s.id })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Aesthetic */}
        <fieldset className="welcome__group">
          <legend className="welcome__legend pixel">Look and feel</legend>
          <div className="welcome__row">
            {AESTHETICS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={"opt opt--wide" + (prefs.aesthetic === a.id ? " is-on" : "")}
                aria-pressed={prefs.aesthetic === a.id}
                onClick={() => setPrefs({ aesthetic: a.id })}
              >
                <strong>{a.label}</strong>
                <span className="opt__hint">{a.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Comfort toggles */}
        <fieldset className="welcome__group">
          <legend className="welcome__legend pixel">Comfort</legend>
          <div className="welcome__row">
            <button
              type="button"
              className={"opt opt--toggle" + (prefs.reduceMotion ? " is-on" : "")}
              aria-pressed={prefs.reduceMotion}
              onClick={() => setPrefs({ reduceMotion: !prefs.reduceMotion })}
            >
              {prefs.reduceMotion ? "✓ " : ""}Reduce motion
            </button>
            <button
              type="button"
              className={"opt opt--toggle" + (prefs.easyRead ? " is-on" : "")}
              aria-pressed={prefs.easyRead}
              onClick={() => setPrefs({ easyRead: !prefs.easyRead })}
            >
              {prefs.easyRead ? "✓ " : ""}Easy-read font
            </button>
          </div>
        </fieldset>

        <button type="button" className="btn welcome__start" onClick={start}>
          Start learning →
        </button>
      </div>
    </div>
  );
}
