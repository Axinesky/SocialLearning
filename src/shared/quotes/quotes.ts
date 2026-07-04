import { apiUrl } from "@/shared/api/apiUrl";

/*
 * Motivational and educational quotes for the homepage.
 *
 * The local list is the source of truth: it works offline and never leaves the
 * homepage blank during a demo on flaky wifi. getQuote tries the proxy for a
 * fresh one first, then falls back to a random local quote.
 */

export interface Quote {
  text: string;
  author: string;
}

export const LOCAL_QUOTES: Quote[] = [
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Mistakes are proof that you are trying.", author: "Unknown" },
  { text: "Every expert was once a beginner.", author: "Helen Hayes" },
  { text: "You do not have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Small steps every day add up to big results.", author: "Unknown" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Your pace is your pace. Comparison is not part of the journey.", author: "Unknown" },
];

export function randomLocalQuote(): Quote {
  return LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
}

/** Fetch a fresh quote via the proxy, falling back to a local one on any error. */
export async function getQuote(signal?: AbortSignal): Promise<Quote> {
  try {
    const res = await fetch(apiUrl("/api/quote"), { signal });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Quote;
    if (data?.text) return data;
    throw new Error("empty");
  } catch {
    return randomLocalQuote();
  }
}
