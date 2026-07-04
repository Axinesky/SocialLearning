import { useEffect, useState } from "react";
import { speak, stop, CLEAR_VOICE } from "@/shared/audio/elevenLabsClient";
import { addXp } from "@/shared/progress/useProgress";
import { FunctionGraph } from "./FunctionGraph";
import { TOPICS, getTopic, type MathsTopic } from "./topics";
import "./maths.css";

/*
 * Maths module.
 *
 * Pupils pick a topic, then work through a worked example one step at a time,
 * with a self-hosted graph that reveals key points (roots, intercepts, turning
 * points) as they go. Short focused steps suit ADHD learners, and the graph is
 * drawn inline so it works offline (no Desmos / CDN dependency). Topics live in
 * topics.ts, so adding one is just another entry there.
 */

export function MathsModule() {
  const [topicId, setTopicId] = useState<string | null>(null);
  const topic = getTopic(topicId ?? undefined);

  if (!topic) return <TopicPicker onPick={setTopicId} />;
  return (
    <MathsTopicView key={topic.id} topic={topic} onBack={() => setTopicId(null)} />
  );
}

/** The grid of topics a pupil can choose from. */
function TopicPicker({ onPick }: { onPick: (id: string) => void }) {
  return (
    <article className="maths">
      <header className="maths__head">
        <p className="maths__eyebrow pixel">▸ visual maths</p>
        <h1>Pick a topic</h1>
      </header>
      <div className="maths__topics">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="panel maths__topiccard"
            onClick={() => onPick(t.id)}
          >
            <span className="maths__topictag pixel">{t.focus}</span>
            <h2 className="maths__topicname">{t.title}</h2>
          </button>
        ))}
      </div>
    </article>
  );
}

/** One topic, worked through step by step alongside the graph. */
function MathsTopicView({ topic, onBack }: { topic: MathsTopic; onBack: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [narrating, setNarrating] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [awarded, setAwarded] = useState(false);

  // Never leave narration playing after the pupil moves elsewhere.
  useEffect(() => () => stop(), []);

  const step = topic.steps[stepIndex];
  const last = topic.steps.length - 1;
  // Points build up cumulatively as you move through the steps.
  const markers = topic.steps.slice(0, stepIndex + 1).flatMap((s) => s.reveal ?? []);

  function goTo(index: number) {
    const idx = Math.max(0, Math.min(last, index));
    setStepIndex(idx);
    // Award XP once, the first time the topic is completed.
    if (idx === last && !awarded) {
      addXp("maths", 20);
      setAwarded(true);
    }
  }

  async function explain() {
    setAudioError(null);
    setNarrating(true);
    try {
      // speak() resolves once playback STARTS, so keep the button in its
      // "Stop" state until the audio actually finishes (or is stopped).
      const audio = await speak(topic.explain, "narrator", CLEAR_VOICE);
      audio.addEventListener("ended", () => setNarrating(false), { once: true });
    } catch {
      setNarrating(false);
      setAudioError(
        "The narration could not play this time. You can carry on with the steps and try the audio again in a moment.",
      );
    }
  }

  function stopNarration() {
    stop();
    setNarrating(false);
  }

  return (
    <article className="maths">
      <button
        type="button"
        className="btn btn--ghost maths__back"
        onClick={() => {
          stop();
          onBack();
        }}
      >
        ← All topics
      </button>
      <header className="maths__head">
        <p className="maths__eyebrow pixel">▸ visual maths quest</p>
        <h1>{topic.title}</h1>
      </header>

      <div className="panel maths__panel">
        <FunctionGraph
          fn={topic.fn}
          domain={topic.domain}
          range={topic.range}
          markers={markers}
        />

        <p className="maths__step pixel">
          Step {stepIndex + 1} / {topic.steps.length}
        </p>
        <p className="maths__text">{step.text}</p>
        <p className="maths__eq">{step.eq}</p>

        {/* Step dots: jump straight to any step. */}
        <div className="maths__dots">
          {topic.steps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={"maths__dot" + (i === stepIndex ? " is-on" : "")}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === stepIndex ? "step" : undefined}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="maths__actions">
          <button
            type="button"
            className="btn"
            onClick={narrating ? stopNarration : explain}
          >
            {narrating ? "⏹ Stop" : "🔊 Explain"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
          >
            ← Back
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => goTo(stepIndex + 1)}
            disabled={stepIndex === last}
          >
            Next →
          </button>
        </div>

        {audioError && (
          <p role="alert" className="maths__error">
            {audioError}
          </p>
        )}
      </div>
    </article>
  );
}

export default MathsModule;
