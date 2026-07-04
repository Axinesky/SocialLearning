import { apiUrl } from "@/shared/api/apiUrl";

/*
 * Frontend ElevenLabs client. Calls our /api/audio/tts proxy (key stays server-side)
 * and plays the returned audio. Great for reducing reading load for ADHD learners.
 */

/** A few named voices so modules can pick a tone without knowing voice IDs.
 * Replace the IDs with real ones from your ElevenLabs account. */
export const VOICES = {
  narrator: "21m00Tcm4TlvDq8ikWAM", // calm default (Rachel)
  warm: "EXAVITQu4vr4xnSDxMaL", // softer, reassuring
  dramatic: "ErXwobaYiN019PkySvjV", // for literature read-alouds
  historical: "JBFqnCBsd6RMkjVDRZzb", // deep, warm British storyteller (George)
} as const;

export type VoiceName = keyof typeof VOICES;

let current: HTMLAudioElement | null = null;

/**
 * Speak `text` aloud. Cancels any previous playback so audio never overlaps.
 * Returns the audio element so callers can sync to it (e.g. the reading buddy).
 */
export async function speak(
  text: string,
  voice: VoiceName = "narrator",
  signal?: AbortSignal,
): Promise<HTMLAudioElement> {
  stop();
  const res = await fetch(apiUrl("/api/audio/tts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId: VOICES[voice] }),
    signal,
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

/** Stop any current narration. */
export function stop(): void {
  if (current) {
    current.pause();
    current = null;
  }
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
