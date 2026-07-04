import { speak, stop } from "@/shared/audio/elevenLabsClient";
import { addXp } from "@/shared/progress/useProgress";
import { useEffect, useRef, useState, type ReactNode } from "react";

declare global {
  interface Window {
    Desmos: any;
  }
}

type Step = {
  text: string;
  eq: string;
  reveal?: { latex: string; id: string }[];
};

const graph = "x^2-5x+6";
const bounds = { left: -2, right: 8, bottom: -3, top: 10 };

const steps: Step[] = [
  { text: "Start with the equation", eq: "x^2 - 5x + 6 = 0" },
  { text: "Look for two numbers that multiply to 6 and add to -5", eq: "-2 and -3" },
  { text: "Write it as two brackets", eq: "(x-2)(x-3) = 0" },
  { text: "If two things multiply to zero, one of them must be zero", eq: "x-2 = 0  or  x-3 = 0" },
  {
    text: "Solve the first bracket",
    eq: "x = 2",
    reveal: [{ id: "root1", latex: "(2,0)" }],
  },
  {
    text: "Solve the second bracket",
    eq: "x = 2  or  x = 3",
    reveal: [{ id: "root2", latex: "(3,0)" }],
  },
];

function formatMath(input: string): ReactNode[] {
  const cleaned = input.replace(/\\text\{([^}]*)\}/g, "$1");
  const parts = cleaned.split(/(\^-?\d+|\^\{[^}]+\})/g);

  return parts.map((part, i) => {
    const match = part.match(/^\^\{?(-?\d+)\}?$/);
    if (match) {
      return <sup key={i}>{match[1]}</sup>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function MathsModule() {
  const [narrating, setNarrating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const calculatorRef = useRef<any>(null);
  const eltRef = useRef<HTMLDivElement>(null);
  const initialisedRef = useRef(false);
  const prefersReducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;

    if (window.Desmos) {
      initCalculator();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://www.desmos.com/api/v4/api.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
      script.async = true;
      script.onload = initCalculator;
      script.onerror = () => console.error("Desmos script failed to load");
      document.head.appendChild(script);
    }

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
      initialisedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initCalculator() {
    if (eltRef.current && !calculatorRef.current && window.Desmos) {
      calculatorRef.current = window.Desmos.GraphingCalculator(eltRef.current, {
        expressionsCollapsed: true,
        settingsMenu: false,
      });
      calculatorRef.current.setExpression({ id: "graph1", latex: `y=${graph}` });
      calculatorRef.current.setMathBounds(bounds);
    }
  }

  // Whenever the step changes, sync the graph's reveal-points to match
  // exactly what should be visible at that step (works going forward or back).
  useEffect(() => {
    if (!calculatorRef.current) return;
    const calc = calculatorRef.current;

    steps.forEach((s, i) => {
      s.reveal?.forEach((r) => {
        if (i <= stepIndex) {
          calc.setExpression({
            id: r.id,
            latex: r.latex,
            color: window.Desmos.Colors.RED,
            showLabel: true,
          });
        } else {
          calc.removeExpression({ id: r.id });
        }
      });
    });
  }, [stepIndex]);

  const step = steps[stepIndex];

  function goTo(index: number) {
    setStepIndex(Math.max(0, Math.min(steps.length - 1, index)));
  }

  async function explain() {
    setNarrating(true);
    try {
      await speak(
        "A parabola is the shape you get when you square a number. " +
          "As the input grows, the output grows much faster, curving upward.",
        "warm",
      );
      addXp("maths", 10);
    } finally {
      setNarrating(false);
    }
  }

  return (
    <article>
      <p className="pixel" style={{ color: "var(--accent)", fontSize: "0.6rem", margin: 0 }}>
        ▸ visual maths quest
      </p>
      <h1 style={{ marginTop: "var(--space-2)" }}>Solving a quadratic by factorising</h1>

      <div className="card" style={{ marginTop: "var(--space-6)" }}>
        <div
          ref={eltRef}
          style={{
            width: "100%",
            height: "320px",
            minHeight: "320px",
            minWidth: "280px",
            borderRadius: "var(--space-2)",
            background: "#ffffff",
          }}
        />

        <div style={{ marginTop: "var(--space-4)" }}>
          <p className="pixel" style={{ fontSize: "0.55rem", color: "var(--text-muted)" }}>
            step {stepIndex + 1} / {steps.length}
          </p>
          <p style={{ margin: "var(--space-2) 0 0" }}>{step.text}</p>
          <p style={{ fontWeight: 600, marginTop: "var(--space-1)", fontSize: "1.1rem" }}>
            {formatMath(step.eq)}
          </p>
        </div>

        {/* Step dots — click any step to jump straight there */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginTop: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                background: i === stepIndex ? "var(--accent)" : "transparent",
                color: i === stepIndex ? "#000" : "var(--accent)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginTop: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <button type="button" className="btn" onClick={narrating ? stop : explain}>
            {narrating ? "⏹ Stop" : "🔊 Explain"}
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
          >
            Previous step
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => goTo(stepIndex + 1)}
            disabled={stepIndex === steps.length - 1}
          >
            Next step
          </button>
        </div>
      </div>
    </article>
  );
}

export default MathsModule;