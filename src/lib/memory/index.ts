/**
 * Memory — Persistent context layer for Jarvis.
 *
 * This module will handle:
 *  - Conversation history persistence
 *  - Summary generation for long conversations
 *  - User preference storage
 *  - Cross-session context retrieval
 *
 * Not yet implemented — stubbed for architecture.
 */

export interface MemoryEntry {
  id: string;
  type: "conversation" | "fact" | "preference";
  content: string;
  timestamp: number;
}

export interface MemoryStore {
  save(entry: MemoryEntry): Promise<void>;
  retrieve(query: string, limit?: number): Promise<MemoryEntry[]>;
  clear(): Promise<void>;
}

/**
 * Placeholder in-memory store. Will be replaced with a proper
 * persistence layer (database, vector store, etc.)
 */
export function createMemoryStore(): MemoryStore {
  const entries: MemoryEntry[] = [];

  return {
    async save(entry: MemoryEntry) {
      entries.push(entry);
    },

    async retrieve(_query: string, limit = 10) {
      // Future: semantic search over entries
      return entries.slice(-limit);
    },

    async clear() {
      entries.length = 0;
    },
  };
}
