import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { speak, stop, type VoiceName } from "@/shared/audio/elevenLabsClient";
import "./reading-buddy.css";

/*
 * ReadingBuddy: a little pixel mascot that hops along the text, revealing one
 * word at a time with a pop.
 *
 * Why it helps: a guided, one-word-at-a-time reveal keeps the eye moving and
 * stops a block of text feeling like a wall, which suits ADHD readers.
 *
 * Modes:
 *  - With a `voice`, the button reads the text aloud (ElevenLabs) and the buddy
 *    hops in time with the narration. If audio is unavailable it falls back to a
 *    steady timed reveal, so the buddy always works.
 *  - With `controls={false}` it is a calm decorative mascot that just perches on
 *    the text (used on the homepage quote).
 *
 * Accessibility: hidden words are only dimmed (not removed), so screen readers
 * still read everything, and reduced motion shows the text in full with no hop.
 *
 * The sprite is a placeholder drawn in CSS. Swap `.buddy__sprite` for the
 * designer's pixel art when it lands.
 */

interface Props {
  text: string;
  /** If set, the reveal button also reads the text aloud and the buddy hops in
   *  time with the narration. Falls back to a steady pace if audio fails. */
  voice?: VoiceName;
  /** Milliseconds per word for the fallback pace when there is no audio. */
  wordMs?: number;
  /** Set false for a decorative, always-on buddy with no button (e.g. a quote). */
  controls?: boolean;
}

const DEFAULT_WORD_MS = 420;

function reducedMotion() {
  return document.documentElement.dataset.motion === "reduced";
}

export function ReadingBuddy({
  text,
  voice,
  wordMs = DEFAULT_WORD_MS,
  controls = true,
}: Props) {
  // Split into tokens keeping the whitespace, so spacing and wrapping are natural.
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const wordIndices = useMemo(
    () =>
      tokens.reduce<number[]>((acc, tok, i) => {
        if (tok.trim().length) acc.push(i);
        return acc;
      }, []),
    [tokens],
  );
  const total = wordIndices.length;

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(0);
  const done = started && !playing;
  const decorative = !controls;

  const wordEls = useRef<Record<number, HTMLSpanElement | null>>({});
  const [buddy, setBuddy] = useState<{ x: number; y: number } | null>(null);
  const audioModeRef = useRef(false);

  async function start() {
    if (reducedMotion()) {
      setStarted(true);
      setShown(total);
      if (voice) speak(text, voice).catch(() => {});
      return;
    }
    setStarted(true);
    setShown(0);

    if (voice) {
      try {
        const audio = await speak(text, voice);
        audioModeRef.current = true;
        audio.addEventListener("timeupdate", () => {
          if (audio.duration) {
            const frac = audio.currentTime / audio.duration;
            setShown(Math.min(total, Math.round(frac * total)));
          }
        });
        audio.addEventListener(
          "ended",
          () => {
            setShown(total);
            setPlaying(false);
            audioModeRef.current = false;
          },
          { once: true },
        );
        setPlaying(true);
        return;
      } catch {
        // No audio (no key, offline): fall through to the timed reveal.
        audioModeRef.current = false;
      }
    }
    setPlaying(true);
  }

  function stopReveal() {
    stop();
    audioModeRef.current = false;
    setPlaying(false);
  }

  // Timed fallback reveal. Skipped while audio is driving the reveal.
  useEffect(() => {
    if (!playing || audioModeRef.current) return;
    if (shown >= total) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setShown((s) => s + 1), wordMs);
    return () => window.clearTimeout(id);
  }, [playing, shown, total, wordMs]);

  // Stop any narration if this unmounts.
  useEffect(() => () => stop(), []);

  // The buddy always sits on the "active" word: the first word before you start,
  // the current word while revealing, and the last word once finished.
  const active = started ? Math.min(Math.max(shown - 1, 0), total - 1) : 0;
  useLayoutEffect(() => {
    const place = () => {
      const el = wordEls.current[wordIndices[active]];
      if (el) setBuddy({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, wordIndices]);

  const label = done
    ? "↻ Read again"
    : voice
      ? "🔊 Read with buddy"
      : "🐣 Reveal with buddy";

  return (
    <div className={"buddy" + (playing ? " is-playing" : "")}>
      {controls && (
        <button
          type="button"
          className="btn btn--ghost buddy__play"
          onClick={playing ? stopReveal : start}
        >
          {playing ? "⏹ Stop" : label}
        </button>
      )}

      <p className="buddy__text english__text">
        {tokens.map((tok, i) => {
          if (!tok.trim()) return <span key={i}>{tok}</span>;
          const order = wordIndices.indexOf(i);
          const isShown = decorative || !started || done || order < shown;
          return (
            <span
              key={i}
              ref={(el) => {
                wordEls.current[i] = el;
              }}
              className={"buddy__word" + (isShown ? " is-shown" : "")}
            >
              {tok}
            </span>
          );
        })}

        {buddy && (
          <span
            className="buddy__sprite"
            style={{ left: buddy.x, top: buddy.y }}
            aria-hidden="true"
          />
        )}
      </p>
    </div>
  );
}
