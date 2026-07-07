import type { ComponentType, CSSProperties } from "react";
import { lazy } from "react";

/*
 * The module contract.
 *
 * Each learning subject (English, Maths, ...) is a self-contained module that
 * exports a default React component. Register it here and it automatically
 * appears in the sidebar and gets its own route at /learn/:id.
 *
 * This is the seam that lets the team work in parallel: you own modules/english,
 * your collaborator owns modules/maths, and nobody edits the same files.
 */

export interface LearningModule {
  /** URL-safe id, used in the route /learn/:id */
  id: string;
  /** Shown in the sidebar and page header */
  title: string;
  /** One calm sentence describing the module */
  description: string;
  /** Emoji or short glyph for the sidebar */
  glyph: string;
  /** Local accent colour override (CSS colour). Keep it muted. */
  accent: string;
  /** Brighter version of the accent for dark mode, where the muted light-mode
   *  colour would leave near-black pill text unreadable. */
  accentDark: string;
  /** The module's screen. Lazy-loaded so modules stay code-split. */
  component: ComponentType;
}

export const modules: LearningModule[] = [
  {
    id: "english",
    title: "English",
    description:
      "AQA GCSE English: Macbeth and An Inspector Calls, with close reading, audio, visuals and exam practice.",
    glyph: "📖",
    accent: "#8a6d3b",
    accentDark: "#d2a95c",
    component: lazy(() => import("./english/EnglishModule")),
  },
  {
    id: "maths",
    title: "Maths",
    description: "See the shapes behind the numbers with animated graphs.",
    glyph: "📈",
    accent: "#4a7c74",
    accentDark: "#74b8ac",
    component: lazy(() => import("./maths/MathsModule")),
  },
];

/**
 * Inline style that sets the module's accent. light-dark() picks the readable
 * variant per scheme, so pill text stays legible in dark mode too.
 */
export function moduleAccentStyle(m: LearningModule): CSSProperties {
  return {
    ["--accent" as string]: `light-dark(${m.accent}, ${m.accentDark})`,
  } as CSSProperties;
}

export function getModule(id: string | undefined): LearningModule | undefined {
  return modules.find((m) => m.id === id);
}
