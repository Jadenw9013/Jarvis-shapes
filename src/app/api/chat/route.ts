import { NextRequest } from "next/server";
import { handleConversation, ChatMessage } from "@/lib/ai/jarvis";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request: messages required", { status: 400 });
    }

    // Filter to only valid roles and non-empty content
    const cleaned: ChatMessage[] = messages
      .filter(
        (m: ChatMessage) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m: ChatMessage) => ({ role: m.role, content: m.content }));

    if (cleaned.length === 0) {
      return new Response("No valid messages", { status: 400 });
    }

    const stream = await handleConversation(cleaned);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Jarvis API]", error);

    const message =
      error instanceof Error && error.message === "ANTHROPIC_API_KEY is not set"
        ? "API key not configured"
        : "Internal server error";

    return new Response(message, { status: 500 });
  }
}
