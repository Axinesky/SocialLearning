import type { MathMarker } from "./FunctionGraph";

/*
 * Maths topics for the Maths module.
 *
 * Each topic is a worked example built around one graph: a function to plot, a
 * sensible viewing window, and a list of short steps. A step can reveal points
 * on the graph (roots, intercepts, turning points), which build up cumulatively
 * as the pupil moves through the steps. To add a topic, copy one of these.
 */

export interface MathStep {
  text: string;
  /** The equation or key line to show for this step. */
  eq: string;
  /** Points revealed on the graph at this step (added to earlier ones). */
  reveal?: MathMarker[];
}

export interface MathsTopic {
  id: string;
  title: string;
  /** Short label for the picker card. */
  focus: string;
  fn: (x: number) => number;
  domain: [number, number];
  range: [number, number];
  steps: MathStep[];
  /** Narration read aloud by the "Explain" button. */
  explain: string;
}

export const TOPICS: MathsTopic[] = [
  {
    id: "quadratic-factorising",
    title: "Solving a quadratic by factorising",
    focus: "Quadratics",
    fn: (x) => x * x - 5 * x + 6,
    domain: [0, 5],
    range: [-1, 7],
    steps: [
      { text: "Start with the equation.", eq: "x² - 5x + 6 = 0" },
      {
        text: "Find two numbers that multiply to 6 and add to -5.",
        eq: "-2 and -3",
      },
      { text: "Write it as two brackets.", eq: "(x - 2)(x - 3) = 0" },
      {
        text: "If two things multiply to make zero, one of them must be zero.",
        eq: "x - 2 = 0  or  x - 3 = 0",
      },
      {
        text: "Solve the first bracket. The curve crosses the x-axis here.",
        eq: "x = 2",
        reveal: [{ x: 2, y: 0, label: "(2, 0)" }],
      },
      {
        text: "Solve the second bracket. That is the other crossing point.",
        eq: "x = 3",
        reveal: [{ x: 3, y: 0, label: "(3, 0)" }],
      },
    ],
    explain:
      "This is a quadratic, so its graph is a U-shaped parabola. Factorising splits " +
      "it into two brackets. The solutions are where the curve crosses the x axis, " +
      "here at x equals 2 and x equals 3.",
  },
  {
    id: "straight-line-graphs",
    title: "Straight-line graphs",
    focus: "Linear graphs",
    fn: (x) => 2 * x + 1,
    domain: [-3, 3],
    range: [-5, 7],
    steps: [
      { text: "A straight line has this general form.", eq: "y = mx + c" },
      {
        text: "c is where the line crosses the y-axis. This is the intercept.",
        eq: "c = 1",
        reveal: [{ x: 0, y: 1, label: "(0, 1)" }],
      },
      { text: "m is the gradient: how steep the line is.", eq: "m = 2" },
      {
        text: "A gradient of 2 means: go up 2 for every 1 across.",
        eq: "up 2, across 1",
        reveal: [{ x: 1, y: 3, label: "(1, 3)" }],
      },
      { text: "So this line is:", eq: "y = 2x + 1" },
    ],
    explain:
      "A straight line follows y equals m x plus c. The number c is where it crosses " +
      "the y axis. The number m is the gradient, which tells you how steep the line " +
      "is. Here c is 1 and m is 2.",
  },
  {
    id: "parabola-turning-point",
    title: "The turning point of a parabola",
    focus: "Quadratics",
    fn: (x) => x * x - 6 * x + 5,
    domain: [0, 6],
    range: [-5, 7],
    steps: [
      { text: "Here is another quadratic.", eq: "y = x² - 6x + 5" },
      { text: "Factorise it to find where it crosses the x-axis.", eq: "(x - 1)(x - 5) = 0" },
      {
        text: "The roots are the two crossing points.",
        eq: "x = 1  or  x = 5",
        reveal: [
          { x: 1, y: 0, label: "(1, 0)" },
          { x: 5, y: 0, label: "(5, 0)" },
        ],
      },
      {
        text: "The turning point sits exactly halfway between the roots.",
        eq: "x = 3",
      },
      {
        text: "Put x = 3 back in to find the lowest point.",
        eq: "lowest point (3, -4)",
        reveal: [{ x: 3, y: -4, label: "(3, -4)" }],
      },
    ],
    explain:
      "This parabola crosses the x axis at x equals 1 and x equals 5. Its turning " +
      "point, the very bottom of the U, sits exactly halfway between the roots at x " +
      "equals 3, giving the lowest point 3, minus 4.",
  },
];

export function getTopic(id: string | undefined): MathsTopic | undefined {
  return TOPICS.find((t) => t.id === id);
}
