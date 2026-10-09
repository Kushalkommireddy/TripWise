// A single place to call whichever AI provider is configured.
// Gemini is checked first because it has a genuinely free tier (no card
// required) — see console.cloud.google.com/apis/credentials or
// aistudio.google.com/apikey. Anthropic is used instead if GEMINI_API_KEY
// isn't set but ANTHROPIC_API_KEY is. If neither is set, callers get a
// clear error explaining how to fix it, not a silent failure.

export class NoAIProviderError extends Error {}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  // Flash-Lite is Google's fastest, cheapest tier — a good fit here since
  // these are simple structured-JSON extraction tasks, not deep reasoning.
  // Falls back to the standard Flash model if Flash-Lite ever 404s (model
  // availability can shift between accounts/regions).
  const MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash"];

  async function attempt(model: string, withThinkingControl: boolean) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          // Give extra headroom on the fallback path in case some of the
          // budget goes to hidden reasoning we couldn't turn off.
          maxOutputTokens: withThinkingControl ? maxTokens : maxTokens * 2,
          ...(withThinkingControl ? { thinkingConfig: { thinkingLevel: "MINIMAL" } } : {}),
        },
      }),
    });
  }

  // Gemini's free tier occasionally returns 503 (overloaded) or 429 (rate
  // limited) under load — both are transient, not real failures. Retry a
  // few times with a short backoff before giving up.
  const RETRYABLE = [503, 429];
  const MAX_RETRIES = 2;
  let res: Response | null = null;
  let model = MODELS[0];

  for (let i = 0; i <= MAX_RETRIES; i++) {
    res = await attempt(model, true);
    if (res.status === 404 && model !== MODELS[1]) {
      // Flash-Lite unavailable on this account/region — fall back once.
      model = MODELS[1];
      res = await attempt(model, true);
    }
    if (res.status === 400) {
      res = await attempt(model, false);
    }
    if (res.ok || !RETRYABLE.includes(res.status)) break;
    if (i < MAX_RETRIES) await sleep(800 * (i + 1)); // 800ms, 1.6s, 2.4s
  }

  if (!res!.ok) {
    const text = await res!.text();
    if (RETRYABLE.includes(res!.status)) {
      throw new Error(
        `Gemini is temporarily overloaded (${res!.status}) after several retries — this is on Google's end, not a bug. Please try again in a moment.`
      );
    }
    throw new Error(`Gemini request failed: ${res!.status} ${text.slice(0, 300)}`);
  }
  const data = await res!.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    const reason = candidate?.finishReason || "unknown";
    throw new Error(
      `Gemini returned no usable text (finishReason: ${reason}). ${
        reason === "MAX_TOKENS" ? "Try again — the response was cut off." : "Try again."
      }`
    );
  }
  return text;
}

async function callAnthropic(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic request failed: ${res.status} ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data.content?.find((c: any) => c.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned an empty response — try again.");
  return text;
}

/**
 * Calls whichever AI provider is configured and returns raw text (expected
 * to be JSON per the prompt). Throws NoAIProviderError if neither
 * GEMINI_API_KEY nor ANTHROPIC_API_KEY is set, so callers can show a clear,
 * actionable message instead of a generic failure.
 */
export async function callAI(prompt: string, maxTokens = 2000): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    const raw = await callGemini(prompt, maxTokens);
    return raw.replace(/```json|```/g, "").trim();
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const raw = await callAnthropic(prompt, maxTokens);
    return raw.replace(/```json|```/g, "").trim();
  }
  throw new NoAIProviderError(
    "AI features need a free API key. Add GEMINI_API_KEY (no card required — get one at aistudio.google.com/apikey) or ANTHROPIC_API_KEY to your .env file."
  );
}
