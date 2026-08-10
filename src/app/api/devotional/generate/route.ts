import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Agent, Runner, withTrace } from "@openai/agents";
import { fetchEsvPassage } from "@/lib/esv";
import { DevotionalEntry, HistoryItem } from "@/lib/devotional";

const PlanItemSchema = z.object({
  day: z.number(),
  reference: z.string(),
  theme: z.string(),
});
const BatchPlanSchema = z.object({ days: z.array(PlanItemSchema) });

const WriterItemSchema = z.object({
  day: z.number(),
  explanation: z.string(),
  soWhat: z.string(),
});
const BatchWriteSchema = z.object({ days: z.array(WriterItemSchema) });

const devotionalPlannerAgent = new Agent({
  name: "Devotional Planner",
  instructions: `You select Bible passages and themes for a personal daily devotional sequence. You will be given a list of day numbers (the user's Nth, N+1th, ... devotional — not calendar dates) and a compact history of passages/themes already covered recently.

Guidelines:
- Choose exactly one passage reference and one short theme per given day number, in order.
- Do not repeat any passage or theme already listed in the recent history. You may continue a thematic arc across a few consecutive days, or deliberately start a new one — this is a devotional, not a sequential verse-by-verse book study, so passages may come from anywhere in Scripture as fits the theme.
- Passage references must be short and precisely fetchable from the ESV Bible API (e.g. "James 1:2-4", "Psalm 23", "Romans 8:28-30", "1 Corinthians 13:4-7"). Choose whatever length is appropriate for a single day's devotional (typically a few verses to a short chapter) — do not always default to the same length.
- Return only the structured plan. Do not write any commentary yet.`,
  model: "gpt-5.6-terra",
  outputType: BatchPlanSchema,
});

const devotionalWriterAgent = new Agent({
  name: "Devotional Writer",
  instructions: `You write short daily devotionals reflecting the theological instincts and interpretive approach of expositors such as John MacArthur, R.C. Sproul, Steven Lawson, Alistair Begg, John Piper, Voddie Baucham, and Paul Washer. Never quote or closely paraphrase any specific published devotional — write original material inspired by their general approach and voice.

For each day you are given the day number, a theme, and the ACTUAL ESV scripture text already fetched for that day. Base every claim strictly on that quoted text — do not introduce verses or claims the text doesn't support.

For each day, write exactly two sections:
1. "explanation" — a single merged section combining historical/literary context, original language/textual insight, careful exegesis of what the passage actually says, and sound hermeneutical reasoning about what it means — grounded strictly in the quoted text, prioritizing authorial intent and canonical consistency over speculation. Go deep into the text itself rather than illustrating it with outside stories or anecdotes.
2. "soWhat" — practical, concrete life application: how this truth should shape belief, attitude, or conduct today.

Each field's text must begin with exactly one markdown heading as its very first line — "explanation" starts with "## Explanation", "soWhat" starts with "## So What?" — followed by the content. Do not repeat that heading again anywhere in the same field, and do not add any other top-level heading.

Do not include the scripture text itself in your output — it is rendered separately. Target roughly 350-500 words total per day, in markdown (you may use bold or lists sparingly beyond the required heading).`,
  model: "gpt-5.6-terra",
  outputType: BatchWriteSchema,
});

function buildPlannerPrompt(dayNumbers: number[], recentHistory: HistoryItem[]): string {
  const historyLines =
    recentHistory.length > 0
      ? recentHistory.map((h) => `- Day ${h.day}: ${h.reference} (${h.theme})`).join("\n")
      : "(none — this is the very first batch)";

  return `Recently covered passages/themes (most recent first), to avoid repeating:
${historyLines}

Plan passages/themes for the following days in this personal devotional sequence, one each, in order:
${dayNumbers.map((d) => `Day ${d}`).join("\n")}`;
}

function buildWriterPrompt(
  days: { day: number; reference: string; theme: string; scriptureText: string }[]
): string {
  return days
    .map(
      (d) =>
        `Day: ${d.day}\nReference: ${d.reference}\nTheme: ${d.theme}\nScripture text:\n${d.scriptureText}`
    )
    .join("\n\n---\n\n");
}

// Writing several days' commentary in a single LLM call risks a long-running
// response that can exceed the serverless function's time limit. Splitting
// into small chunks run concurrently keeps each individual call short while
// still covering the whole batch in roughly the time of the slowest chunk.
const WRITER_CHUNK_SIZE = 2;

async function writeChunk(
  days: { day: number; reference: string; theme: string; scriptureText: string }[]
): Promise<{ day: number; explanation: string; soWhat: string }[]> {
  const runner = new Runner();
  const result = await runner.run(devotionalWriterAgent, buildWriterPrompt(days));
  if (!result.finalOutput) throw new Error("Writer returned no output");
  return (result.finalOutput as { days: { day: number; explanation: string; soWhat: string }[] }).days;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { dayNumbers, recentHistory = [] } = await request.json();

    if (!Array.isArray(dayNumbers) || dayNumbers.length === 0) {
      return NextResponse.json({ error: "dayNumbers is required" }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }
    if (!process.env.ESV_API_KEY) {
      return NextResponse.json(
        { error: "ESV_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const plan = await withTrace("Devotional Planner", async () => {
      const runner = new Runner();
      const result = await runner.run(devotionalPlannerAgent, buildPlannerPrompt(dayNumbers, recentHistory));
      if (!result.finalOutput) throw new Error("Planner returned no output");
      return result.finalOutput as { days: { day: number; reference: string; theme: string }[] };
    });

    const fetched = await Promise.all(
      plan.days.map(async (d) => {
        try {
          const passage = await fetchEsvPassage(d.reference);
          return { ...d, reference: passage.reference, scriptureText: passage.text, ok: true as const };
        } catch (err) {
          console.error(`ESV fetch failed for "${d.reference}":`, err);
          return { ...d, ok: false as const };
        }
      })
    );
    const usable = fetched.filter(
      (d): d is typeof d & { ok: true; scriptureText: string } => d.ok
    );

    if (usable.length === 0) {
      return NextResponse.json({ error: "Could not fetch any passages from the ESV API" }, { status: 502 });
    }

    const writtenChunks = await withTrace("Devotional Writer", async () =>
      Promise.all(chunk(usable, WRITER_CHUNK_SIZE).map(writeChunk))
    );
    const written = writtenChunks.flat();

    const byDay = new Map(written.map((w) => [w.day, w]));
    const now = Date.now();
    const entries: DevotionalEntry[] = usable
      .filter((d) => byDay.has(d.day))
      .map((d) => {
        const writtenEntry = byDay.get(d.day)!;
        return {
          day: d.day,
          reference: d.reference,
          theme: d.theme,
          scriptureText: d.scriptureText,
          explanation: writtenEntry.explanation,
          soWhat: writtenEntry.soWhat,
          completed: false,
          completedAt: null,
          generatedAt: now,
        };
      });

    if (entries.length === 0) {
      return NextResponse.json({ error: "Devotional writer returned no usable entries" }, { status: 502 });
    }

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    console.error("Devotional generation error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
