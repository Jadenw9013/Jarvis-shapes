export function ThinkingIndicator() {
  return (
    <div className="animate-fade-in flex justify-start">
      <div className="bg-jarvis-ai border-l-2 border-jarvis-accent/30 px-4 py-3 rounded-2xl">
        <span className="text-[10px] uppercase tracking-widest text-jarvis-accent/60 block mb-2 font-medium">
          Jarvis
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-jarvis-accent/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-jarvis-accent/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-jarvis-accent/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
