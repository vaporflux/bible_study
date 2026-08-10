// Server-side only. Never import this into a "use client" component —
// it reads process.env.ESV_API_KEY, which must not reach the browser bundle.
// (The required ESV copyright notice string lives in src/lib/devotional.ts
// instead, since that module is safe to import from client components.)

export interface EsvPassage {
  reference: string;
  text: string;
}

const ESV_API_URL = "https://api.esv.org/v3/passage/text/";

export async function fetchEsvPassage(reference: string): Promise<EsvPassage> {
  const apiKey = process.env.ESV_API_KEY;
  if (!apiKey) {
    throw new Error("ESV_API_KEY is not configured.");
  }

  const params = new URLSearchParams({
    q: reference,
    "include-headings": "false",
    "include-footnotes": "false",
    "include-verse-numbers": "true",
    "include-short-copyright": "false",
    "include-passage-references": "false",
  });

  const res = await fetch(`${ESV_API_URL}?${params.toString()}`, {
    headers: { Authorization: `Token ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`ESV API error (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const passages: string[] = data.passages ?? [];
  if (passages.length === 0) {
    throw new Error(`ESV API returned no text for reference "${reference}"`);
  }

  return {
    reference: (data.canonical as string) ?? reference,
    text: passages.join("\n\n").trim(),
  };
}
