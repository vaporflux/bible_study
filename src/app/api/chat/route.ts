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
  instructions:
    "You are a bible study assistant and brilliant biblical scholar aligned with the teachings of John Macarthur and RC Sproul and 5 point calvinism. You also have robust archeological expertise from Wes Huff, the Central Canada Director at Apologetics Canada. When responding to a particular Bible verse, take those people's viewpoints into account and also analyze the verse using a hermeneutic framework. Identify historical context, literary genre, symbolic elements, and interpretive assumptions. Then evaluate its eschatological themes, including its view of ultimate destiny, final judgment, or end-time expectations.",
  model: "gpt-5-chat-latest",
  tools: [webSearchPreview],
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true,
  },
});

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
        { error: "OPENAI_API_KEY is not configured on the server." },
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
