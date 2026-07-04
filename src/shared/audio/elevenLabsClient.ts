import { apiUrl } from "@/shared/api/apiUrl";

/*
 * Frontend ElevenLabs client. Calls our /api/audio/tts proxy (key stays server-side)
 * and plays the returned audio. Great for reducing reading load for ADHD learners.
 */

/** A few named voices so modules can pick a tone without knowing voice IDs.
 *
 * IMPORTANT: only use voices from ElevenLabs' CURRENT lineup. The old legacy
 * voices (Rachel 21m00Tcm4TlvDq8ikWAM, Antoni ErXwobaYiN019PkySvjV, etc.) have
 * been deprecated and return voice_not_found on newer accounts, which is why
 * narration silently failed for some modules. If a voice is still missing on
 * your account, the server falls back to a known-good default voice. */
export const VOICES = {
  narrator: "Xb7hH8MSUJpSbSDYk0k2", // Alice: clear, confident British
  warm: "EXAVITQu4vr4xnSDxMaL", // Sarah: soft, reassuring
  dramatic: "onwK4e9ZLuTAKqWW03F9", // Daniel: deep, authoritative British
  historical: "JBFqnCBsd6RMkjVDRZzb", // George: warm British storyteller
} as const;

export type VoiceName = keyof typeof VOICES;

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

// Clear but natural settings for factual narration (maths). The old values
// (stability 0.7, style 0) produced a flat, robotic read; a little less
// stability and a touch of style lets the voice breathe while staying accurate.
export const CLEAR_VOICE: VoiceSettings = {
  stability: 0.55,
  similarity_boost: 0.8,
  style: 0.2,
  use_speaker_boost: true,
};

let current: HTMLAudioElement | null = null;

/**
 * Speak `text` aloud. Cancels any previous playback so audio never overlaps.
 * Returns the audio element so callers can sync to it (e.g. the reading buddy).
 * Pass `settings` to tune delivery (e.g. CLEAR_VOICE for instructional content).
 */
export async function speak(
  text: string,
  voice: VoiceName = "narrator",
  settings?: VoiceSettings,
): Promise<HTMLAudioElement> {
  stop();
  const res = await fetch(apiUrl("/api/audio/tts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId: VOICES[voice], voiceSettings: settings }),
  });
  if (!res.ok) throw new Error(`TTS failed: ${res.status} ${await readError(res)}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  current = audio;
  audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
  await audio.play();
  return audio;
}

/** Stop any current narration (both ElevenLabs audio and the browser voice). */
export function stop(): void {
  if (current) {
    current.pause();
    current = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Free fallback: read the text with the browser's built-in voice. No key, no
 * credits, works offline. Used when ElevenLabs is unavailable (e.g. the
 * character allowance has run out) so narration never just goes silent.
 * Resolves when the speech finishes.
 */
export function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("This browser has no built-in voice."));
      return;
    }
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.95;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("The built-in voice failed."));
    window.speechSynthesis.speak(utterance);
  });
}

async function readError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return "No details returned by API.";
  try {
    const parsed = JSON.parse(raw) as { error?: string; details?: string };
    return parsed.details ?? parsed.error ?? raw;
  } catch {
    return raw;
  }
}
