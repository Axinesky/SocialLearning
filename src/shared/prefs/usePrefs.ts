import { useEffect, useState } from "react";

/*
 * User preferences: the accessibility heart of the app.
 *
 * Every option maps to a data-* attribute on <html>, and the CSS token system
 * reacts to those. So changing a preference here restyles the whole app with no
 * component changes. Persisted to localStorage and applied before first paint.
 */

export type Theme = "sky" | "meadow" | "dusk" | "ocean" | "mono";
export type TextSize = "small" | "medium" | "large";
export type Aesthetic = "pixel" | "plain";

export interface Prefs {
  theme: Theme;
  textSize: TextSize;
  aesthetic: Aesthetic;
  reduceMotion: boolean;
  easyRead: boolean;
  onboarded: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  theme: "sky",
  textSize: "medium",
  aesthetic: "pixel",
  reduceMotion: false,
  easyRead: false,
  onboarded: false,
};

const KEY = "sl.prefs.v1";

function read(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

let state: Prefs = read();
const listeners = new Set<() => void>();

/** Push the current prefs onto <html> as data-* attributes for the CSS to read. */
export function applyPrefs(p: Prefs = state) {
  const el = document.documentElement;
  el.dataset.theme = p.theme;
  el.dataset.text = p.textSize;
  el.dataset.aesthetic = p.aesthetic;
  el.dataset.motion = p.reduceMotion ? "reduced" : "full";
  el.dataset.reading = p.easyRead ? "dyslexic" : "default";
}

/** Call once at start-up so styles are correct before the app renders. */
export function initPrefs() {
  applyPrefs(state);
}

export function setPrefs(patch: Partial<Prefs>) {
  state = { ...state, ...patch };
  localStorage.setItem(KEY, JSON.stringify(state));
  applyPrefs(state);
  listeners.forEach((l) => l());
}

export function usePrefs() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  return { prefs: state, setPrefs };
}
