export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "bible-study-conversations";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function deriveTitle(messages: Message[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user");
  if (!firstUserMsg) return "New Conversation";
  const text = firstUserMsg.content.trim();
  return text.length > 60 ? text.slice(0, 60) + "..." : text;
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveAll(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function createConversation(): Conversation {
  const conv: Conversation = {
    id: generateId(),
    title: "New Conversation",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = loadConversations();
  all.unshift(conv);
  saveAll(all);
  return conv;
}

export function updateConversation(id: string, messages: Message[]) {
  const all = loadConversations();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  all[idx].messages = messages;
  all[idx].title = deriveTitle(messages);
  all[idx].updatedAt = Date.now();
  saveAll(all);
}

export function deleteConversation(id: string) {
  const all = loadConversations().filter((c) => c.id !== id);
  saveAll(all);
}

export function getConversation(id: string): Conversation | undefined {
  return loadConversations().find((c) => c.id === id);
}
