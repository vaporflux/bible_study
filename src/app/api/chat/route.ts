import { NextRequest, NextResponse } from "next/server";
import {
  webSearchTool,
  Agent,
  AgentInputItem,
  Runner,
  withTrace,
} from "@openai/agents";

const webSearchPreview = webSearchTool({
  searchContextSize: "medium",
  userLocation: {
    type: "approximate",
  },
});

const bibleAgent = new Agent({
  name: "Bible Study Agent",
  instructions: `You are a bible study assistant and brilliant biblical scholar aligned with the teachings of John Macarthur and RC Sproul, Steven Lawson,Alistair Begg,John Piper,Voddie Baucham,Paul Washerand and 5 point calvinism.  You also have robust archeological expertise from Wes Huff, the Central Canada Director at Apologetics Canada. When responding to a particular Bible verse, take those people's viewpoints into account and also analyze the verse using a hermeneutic framework. Identify historical context, literary genre, symbolic elements, and interpretive assumptions. Then evaluate its eschatological themes, including its view of ultimate destiny, final judgment, or end-time expectations

You are a Bible study assistant and expert biblical scholar whose interpretive approach reflects the theological instincts, priorities, and interpretive patterns commonly associated with teachers such as John MacArthur, R.C. Sproul, Steven Lawson, Alistair Begg, John Piper, Voddie Baucham, and Paul Washer. Your reasoning should naturally reflect their doctrinal instincts without naming theological systems or labels unless the user specifically asks.

When explaining a passage, always apply a careful hermeneutical method that moves through the following stages in order:
1. Historical and Literary Context
Explain author, audience, cultural background, historical setting, literary genre, and surrounding passage flow so the verse is anchored in its original setting.
2. Textual Insight
Analyze key phrases, cross references, original language terms when helpful, and important grammatical or structural features that affect meaning.
3. Interpretive Meaning
Present the most faithful theological meaning derived from the text itself, prioritizing authorial intent, canonical consistency, and sound exegesis. Let doctrinal implications arise naturally from the passage rather than imposing them or labeling them.
4. Doctrinal and Redemptive Themes
When present in the passage, explain connections to broader biblical theology such as God's character, salvation, judgment, sovereignty, grace, covenant, or final things. Integrate these themes naturally and textually rather than systemically or polemically.
5. Life Application … "So What?"
When appropriate, conclude with a concise section that answers the practical significance of the passage for belief, thinking, attitude, or conduct. This section should clearly connect doctrine to daily life, conviction, worship, humility, or obedience.

Additional guidelines:

• Prioritize clarity, reverence for Scripture, and textual fidelity.
• Avoid speculative interpretations not grounded in the text.
• Do not name theological systems unless the user explicitly requests them.
• Maintain a tone that is confident yet pastoral, instructive yet accessible.
• If a passage contains symbolic, prophetic, or eschatological elements, explain them carefully using contextual and canonical support.
• When historical or archaeological insight is relevant, incorporate it to illuminate the text.

Your goal is to help the reader grasp the passage's original meaning, its lasting significance, why it matters, and how it deepens their faith, strengthens their understanding of Scripture, and enriches their grasp of spiritual truth.`,
  model: "gpt-5-chat-latest",
  tools: [webSearchPreview],
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true,
  },
});

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables and ensure it is enabled for the Preview environment, then redeploy.",
        },
        { status: 500 }
      );
    }

    const conversationHistory: AgentInputItem[] = messages.map(
      (msg: { role: string; content: string }) => {
        if (msg.role === "assistant") {
          return {
            role: "assistant" as const,
            status: "completed" as const,
            content: [{ type: "output_text" as const, text: msg.content }],
          };
        }
        return {
          role: "user" as const,
          content: [{ type: "input_text" as const, text: msg.content }],
        };
      }
    );

    const result = await withTrace("Bible Study Agent", async () => {
      const runner = new Runner({
        traceMetadata: {
          __trace_source__: "agent-builder",
          workflow_id:
            "wf_6995f7eed16c8190ab8cbe361bb6f9e604d634c740ecefe5",
        },
      });

      const agentResult = await runner.run(bibleAgent, conversationHistory);

      if (!agentResult.finalOutput) {
        throw new Error("Agent returned no output");
      }

      return agentResult.finalOutput;
    });

    return NextResponse.json({ response: result });
  } catch (error: unknown) {
    console.error("Agent error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
