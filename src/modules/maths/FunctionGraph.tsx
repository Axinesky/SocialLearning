import { useEffect, useRef } from "react";
import "./maths.css";

/*
 * A tiny self-hosted graph, drawn as inline SVG.
 *
 * Replaces the old Desmos embed, which loaded from a CDN and broke when the
 * network was unavailable. This has no dependencies, works fully offline, and
 * is theme-aware (it uses the app's colour tokens), so it looks right in light,
 * dark and every colour theme.
 *
 * It is animated: the curve "draws itself on", and each revealed point pops in.
 * That gives the lively, engaging feel of an animated graph while staying real
 * time and interactive. Reduced motion is respected (the draw-on is skipped).
 */

function reducedMotion() {
  return (
    document.documentElement.dataset.motion === "reduced" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface MathMarker {
  x: number;
  y: number;
  label: string;
}

interface Props {
  fn: (x: number) => number;
  domain: [number, number];
  range: [number, number];
  markers?: MathMarker[];
}

const W = 460;
const H = 320;
const PAD = 34;

export function FunctionGraph({ fn, domain, range, markers = [] }: Props) {
  const [xmin, xmax] = domain;
  const [ymin, ymax] = range;
  const plotW = W - 2 * PAD;
  const plotH = H - 2 * PAD;

  const sx = (x: number) => PAD + ((x - xmin) / (xmax - xmin)) * plotW;
  const sy = (y: number) => PAD + ((ymax - y) / (ymax - ymin)) * plotH;

  // Sample the curve, breaking the path where it leaves the visible range so a
  // steep parabola does not draw a huge line across the top.
  const N = 200;
  let d = "";
  let pen = false;
  for (let i = 0; i <= N; i++) {
    const x = xmin + (i / N) * (xmax - xmin);
    const y = fn(x);
    if (y >= ymin && y <= ymax) {
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)} `;
      pen = true;
    } else {
      pen = false;
    }
  }

  const xTicks = ticks(xmin, xmax);
  const yTicks = ticks(ymin, ymax);
  const hasXAxis = ymin <= 0 && ymax >= 0;
  const hasYAxis = xmin <= 0 && xmax >= 0;

  // Draw the curve on: dash the whole path, then animate the dash offset to 0.
  // Re-runs when the curve (d) changes, e.g. switching topic.
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    if (reducedMotion()) {
      p.style.strokeDasharray = "none";
      p.style.strokeDashoffset = "0";
      return;
    }
    const len = p.getTotalLength();
    p.style.transition = "none";
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = String(len);
    p.getBoundingClientRect(); // force reflow so the next change animates
    p.style.transition = "stroke-dashoffset 0.9s ease";
    p.style.strokeDashoffset = "0";
  }, [d]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mgraph" role="img" aria-label="Graph of the function">
      {xTicks.map((t) => (
        <line key={`gx${t}`} className="mgraph__grid" x1={sx(t)} y1={PAD} x2={sx(t)} y2={H - PAD} />
      ))}
      {yTicks.map((t) => (
        <line key={`gy${t}`} className="mgraph__grid" x1={PAD} y1={sy(t)} x2={W - PAD} y2={sy(t)} />
      ))}

      {hasXAxis && (
        <line className="mgraph__axis" x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} />
      )}
      {hasYAxis && (
        <line className="mgraph__axis" x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} />
      )}

      {hasXAxis &&
        xTicks.map((t) =>
          t === 0 ? null : (
            <text key={`tx${t}`} className="mgraph__tick" x={sx(t)} y={sy(0) + 15} textAnchor="middle">
              {t}
            </text>
          ),
        )}
      {hasYAxis &&
        yTicks.map((t) =>
          t === 0 ? null : (
            <text key={`ty${t}`} className="mgraph__tick" x={sx(0) - 8} y={sy(t) + 4} textAnchor="end">
              {t}
            </text>
          ),
        )}

      <path ref={pathRef} className="mgraph__curve" d={d} fill="none" />

      {markers.map((m) => (
        <g className="mgraph__marker" key={`${m.x},${m.y},${m.label}`}>
          <circle className="mgraph__point" cx={sx(m.x)} cy={sy(m.y)} r={6} />
          <text className="mgraph__label" x={sx(m.x)} y={sy(m.y) - 12} textAnchor="middle">
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Integer tick values within [min, max]. */
function ticks(min: number, max: number): number[] {
  const out: number[] = [];
  for (let t = Math.ceil(min); t <= Math.floor(max); t++) out.push(t);
  return out;
}
