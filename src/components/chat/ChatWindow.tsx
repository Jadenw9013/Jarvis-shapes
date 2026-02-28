"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { InputBar } from "./InputBar";
import { ThinkingIndicator } from "./ThinkingIndicator";
import type { JarvisVisualControl } from "@/components/jarvis-visual/useJarvisVisualState";
import type { SceneDescriptor } from "@/lib/scene/sceneStore";
import { AVATAR_DESCRIPTOR } from "@/lib/scene/sceneStore";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  visualControl?: JarvisVisualControl;
  onSceneCommand?: (desc: SceneDescriptor) => void;
}

// ---------------------------------------------------------------------------
// SCENE_COMMAND parser
// ---------------------------------------------------------------------------

const SCENE_CMD_REGEX = /<SCENE_COMMAND>\s*(\{[\s\S]*?\})\s*<\/SCENE_COMMAND>/;

const PRIMITIVE_TYPES = new Set([
  "sphere",
  "cube",
  "pyramid",
  "torus",
  "cylinder",
]);

function extractSceneCommand(
  text: string
): { cleanText: string; descriptor: SceneDescriptor | null } {
  const match = text.match(SCENE_CMD_REGEX);
  if (!match) return { cleanText: text, descriptor: null };

  const cleanText = text.replace(SCENE_CMD_REGEX, "").trimEnd();

  try {
    const parsed = JSON.parse(match[1]);

    // New format: { generator, type, points?, depth? }
    if (parsed.generator === "polygon_extrude" && Array.isArray(parsed.points)) {
      return {
        cleanText,
        descriptor: {
          generator: "polygon_extrude",
          type: typeof parsed.type === "string" ? parsed.type : "custom",
          points: parsed.points,
          depth: typeof parsed.depth === "number" ? parsed.depth : 0.5,
        },
      };
    }

    // New format primitive: { generator: "primitive", type: "cube" }
    if (parsed.generator === "primitive" && PRIMITIVE_TYPES.has(parsed.type)) {
      return {
        cleanText,
        descriptor: { generator: "primitive", type: parsed.type },
      };
    }

    // Avatar reset
    if (parsed.object === "avatar" || parsed.generator === "avatar") {
      return { cleanText, descriptor: AVATAR_DESCRIPTOR };
    }

    // Legacy format: { action: "replace", object: "cube" }
    if (typeof parsed.object === "string") {
      if (PRIMITIVE_TYPES.has(parsed.object)) {
        return {
          cleanText,
          descriptor: { generator: "primitive", type: parsed.object },
        };
      }
    }

    return { cleanText, descriptor: null };
  } catch {
    return { cleanText, descriptor: null };
  }
}

// ---------------------------------------------------------------------------
// ChatWindow
// ---------------------------------------------------------------------------

export function ChatWindow({ visualControl, onSceneCommand }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsThinking(true);
    visualControl?.setState("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      const assistantId = crypto.randomUUID();
      let rawContent = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsThinking(false);
      visualControl?.setState("speaking");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        rawContent += chunk;

        // Strip any partial or complete SCENE_COMMAND from display
        const { cleanText } = extractSceneCommand(rawContent);
        const displayText = cleanText
          .replace(/<SCENE_COMMAND>[\s\S]*$/, "")
          .trimEnd();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: displayText } : m
          )
        );
      }

      // Final parse
      const { cleanText, descriptor } = extractSceneCommand(rawContent);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: cleanText } : m
        )
      );

      if (descriptor) {
        onSceneCommand?.(descriptor);
      }

      visualControl?.setState("idle");
    } catch (err) {
      const errorText =
        err instanceof Error && err.message === "Request failed"
          ? "Connection to my backend failed. Verify the API key is configured and the server is running."
          : "Something went wrong on my end. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorText,
        },
      ]);
      visualControl?.setState("idle");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-jarvis-text-dim text-sm tracking-wide">
              How can I assist you?
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isThinking && <ThinkingIndicator />}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <InputBar onSend={handleSend} disabled={isThinking} />
      </div>
    </div>
  );
}
