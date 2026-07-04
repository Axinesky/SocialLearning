import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { modules } from "@/modules/registry";
import { useProgress, levelFromXp } from "@/shared/progress/useProgress";
import { getQuote, randomLocalQuote, type Quote } from "@/shared/quotes/quotes";
import { ReadingBuddy } from "@/shared/buddy/ReadingBuddy";
import "./home.css";

export function Home() {
  const { xpFor } = useProgress();
  const [quote, setQuote] = useState<Quote>(randomLocalQuote);

  // Show a local quote instantly, then quietly swap in a fresh one if wifi allows.
  useEffect(() => {
    const controller = new AbortController();
    getQuote(controller.signal).then(setQuote).catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <div className="home">
      <header className="home__hero">
        <p className="home__eyebrow pixel">▸ welcome back</p>
        <h1>Ready when you are</h1>
      </header>

      {/* A calm, encouraging quote instead of a wall of text, with the buddy
          perched on it as a friendly, always-present mascot. */}
      <figure className="home__quote panel">
        <blockquote className="home__quoteblock">
          <ReadingBuddy key={quote.text} text={`“${quote.text}”`} controls={false} />
        </blockquote>
        <figcaption>{quote.author}</figcaption>
        <button
          type="button"
          className="home__refresh"
          aria-label="New quote"
          onClick={() => setQuote(randomLocalQuote())}
        >
          ↻
        </button>
      </figure>

      <h2 className="home__pick pixel">Pick a quest</h2>
      <section aria-label="Quests" className="home__grid">
        {modules.map((m) => {
          const { level, pct } = levelFromXp(xpFor(m.id));
          return (
            <Link
              key={m.id}
              to={`/learn/${m.id}`}
              className="panel home__questcard"
              style={{ ["--accent" as string]: m.accent }}
            >
              <div className="home__questtop">
                <span className="home__glyph" aria-hidden="true">
                  {m.glyph}
                </span>
                <span className="home__lv pixel">Lv.{level}</span>
              </div>
              <h3 className="home__questname">{m.title}</h3>
              <p className="home__questdesc">{m.description}</p>
              <div className="xpbar home__questxp" aria-hidden="true">
                <div className="xpbar__fill" style={{ width: `${pct}%` }} />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
