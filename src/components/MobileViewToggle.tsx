"use client";

type MobileTab = "chat" | "visual";

interface MobileViewToggleProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function MobileViewToggle({
  activeTab,
  onTabChange,
}: MobileViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-jarvis-surface/80 border border-jarvis-border rounded-lg p-0.5">
      <button
        onClick={() => onTabChange("chat")}
        className={`
          px-4 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-widest transition-colors
          ${
            activeTab === "chat"
              ? "bg-jarvis-accent/15 text-jarvis-accent"
              : "text-jarvis-text-dim hover:text-jarvis-text"
          }
        `}
      >
        Chat
      </button>
      <button
        onClick={() => onTabChange("visual")}
        className={`
          px-4 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-widest transition-colors
          ${
            activeTab === "visual"
              ? "bg-jarvis-accent/15 text-jarvis-accent"
              : "text-jarvis-text-dim hover:text-jarvis-text"
          }
        `}
      >
        Visual
      </button>
    </div>
  );
}
