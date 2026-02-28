import type { Message } from "./ChatWindow";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`animate-fade-in flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? "bg-jarvis-user border border-jarvis-border text-jarvis-text"
              : "bg-jarvis-ai text-jarvis-text border-l-2 border-jarvis-accent/30"
          }
        `}
      >
        {!isUser && (
          <span className="text-[10px] uppercase tracking-widest text-jarvis-accent/60 block mb-1.5 font-medium">
            Jarvis
          </span>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
