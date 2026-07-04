import express from "express";
import cors from "cors";
import "dotenv/config";

/*
 * API proxy. This is the ONLY place the API keys live. The frontend calls
 * /api/* here; we add the secret key and forward to Google / ElevenLabs.
 *
 * Keys come from .env (see .env.example). Never move these calls to the browser.
 */

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const PORT = Number(process.env.API_PORT ?? 8787);
const ELEVEN_MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2";

// Models: override via env if you want a different one.
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? "gemini-2.5-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
// Image provider. Default "pollinations" is free and needs no key. Set
// IMAGE_PROVIDER=gemini to use Gemini instead (needs credits).
const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER ?? "pollinations";

function requireKey(res: express.Response, key: string | undefined, name: string) {
  if (!key) {
    res.status(500).json({ error: `${name} is not set. Add it to .env and restart.` });
    return false;
  }
  return true;
}

async function readErrorBody(r: Response): Promise<string> {
  const raw = await r.text();
  if (!raw) return "No details returned by upstream service.";
  try {
    const parsed = JSON.parse(raw) as { detail?: { message?: string }; message?: string };
    return parsed.detail?.message ?? parsed.message ?? raw;
  } catch {
    return raw;
  }
}

/** Text generation (explanations, simplified rephrasings, quiz items). */
app.post("/api/ai/text", async (req, res) => {
  if (!requireKey(res, GEMINI_KEY, "GEMINI_API_KEY")) return;
  const { prompt, system } = req.body as { prompt?: string; system?: string };
  if (!prompt) return res.status(400).json({ error: "Missing 'prompt'." });

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          ...(system
            ? { systemInstruction: { parts: [{ text: system }] } }
            : {}),
        }),
      },
    );
    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: "Gemini text request failed.", details: await readErrorBody(r) });
    }
    const data = await r.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/** Image generation: returns a data URL ready for <img src>. */
app.post("/api/ai/image", async (req, res) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt) return res.status(400).json({ error: "Missing 'prompt'." });

  // Free default: Pollinations needs no key. Set IMAGE_PROVIDER=gemini for Gemini.
  if (IMAGE_PROVIDER !== "gemini") {
    try {
      // flux = best free model; enhance=true expands the prompt with an LLM for
      // much better detail; larger size renders more cleanly.
      const url =
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
        `?width=1024&height=576&nologo=true&enhance=true&model=flux`;
      // Image generation can be slow; cap it so the pupil never waits forever.
      const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!r.ok) {
        return res
          .status(502)
          .json({ error: "Image generation failed.", details: await readErrorBody(r) });
      }
      const buf = Buffer.from(await r.arrayBuffer());
      return res.json({ dataUrl: `data:image/jpeg;base64,${buf.toString("base64")}` });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  // Gemini path (opt-in, needs credits).
  if (!requireKey(res, GEMINI_KEY, "GEMINI_API_KEY")) return;
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      },
    );
    if (!r.ok) {
      const details = await readErrorBody(r);
      const depleted = details.toLowerCase().includes("prepayment credits are depleted");
      return res.status(r.status).json({
        error: "Gemini image request failed.",
        details,
        ...(depleted
          ? {
              guidance:
                "Top up Gemini prepayment credits in Google AI Studio, then retry image generation.",
            }
          : {}),
      });
    }
    const data = await r.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData,
    );
    if (!img?.inlineData) {
      return res.status(502).json({ error: "No image returned by the model." });
    }
    const { mimeType, data: b64 } = img.inlineData;
    res.json({ dataUrl: `data:${mimeType};base64,${b64}` });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/** Text-to-speech via ElevenLabs: streams back audio/mpeg. */
app.post("/api/audio/tts", async (req, res) => {
  if (!requireKey(res, ELEVEN_KEY, "ELEVENLABS_API_KEY")) return;
  const { text, voiceId, voiceSettings } = req.body as {
    text?: string;
    voiceId?: string;
    voiceSettings?: Record<string, unknown>;
  };
  if (!text || !voiceId)
    return res.status(400).json({ error: "Missing 'text' or 'voiceId'." });

  // Expressive default (good for dramatic reading); callers can override, e.g.
  // maths sends clearer, steadier settings for accurate narration.
  const settings = voiceSettings ?? {
    stability: 0.4,
    similarity_boost: 0.85,
    style: 0.3,
    use_speaker_boost: true,
  };

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY!,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVEN_MODEL,
          voice_settings: settings,
        }),
      },
    );
    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: "ElevenLabs request failed.", details: await readErrorBody(r) });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/*
 * A fresh educational / motivational quote. No key needed. The frontend already
 * falls back to a local list, so if this source is down it is not a problem.
 */
app.get("/api/quote", async (_req, res) => {
  try {
    const r = await fetch(
      "https://api.quotable.io/random?tags=education|wisdom|inspirational&maxLength=140",
    );
    if (!r.ok) return res.status(502).json({ error: "quote source down" });
    const data = await r.json();
    res.json({ text: data.content, author: data.author });
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
});

app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    gemini: Boolean(GEMINI_KEY),
    elevenlabs: Boolean(ELEVEN_KEY),
    elevenlabsModel: ELEVEN_MODEL,
  }),
);

app.listen(PORT, () => {
  console.log(`API proxy on http://localhost:${PORT}`);
  if (!GEMINI_KEY) console.warn("  ⚠ GEMINI_API_KEY not set");
  if (!ELEVEN_KEY) console.warn("  ⚠ ELEVENLABS_API_KEY not set");
});
