"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import SuggestedPrompts from "@/components/SuggestedPrompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-parchment-dark/50 bg-parchment/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-leather"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-leather leading-tight">
              Bible Study Agent
            </h1>
            <p className="text-xs text-ink-light/60">
              Reformed Theology &middot; Hermeneutics &middot; Archaeology
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold-light/20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-bold text-leather mb-2">
                  Welcome to Bible Study Agent
                </h2>
                <p className="text-ink-light/70 max-w-md mx-auto text-sm leading-relaxed">
                  Ask about any Bible verse, theological concept, or
                  archaeological evidence. Grounded in Reformed theology with
                  insights from MacArthur, Sproul, and Wes Huff.
                </p>
              </div>
              <SuggestedPrompts onSelect={sendMessage} />
            </div>
          )}

          {hasMessages && (
            <div className="space-y-5">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && <TypingIndicator />}
              {error && (
                <div className="flex justify-center animate-fade-in-up">
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm max-w-md">
                    <p className="font-semibold mb-0.5">Error</p>
                    <p>{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        const lastUserMsg = [...messages]
                          .reverse()
                          .find((m) => m.role === "user");
                        if (lastUserMsg) {
                          setMessages(messages.slice(0, -1));
                          sendMessage(lastUserMsg.content);
                        }
                      }}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 border-t border-parchment-dark/50 bg-parchment/90 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto px-4 py-3"
        >
          <div className="flex items-end gap-2 bg-white/70 border border-parchment-dark/60 rounded-2xl px-4 py-2 focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/20 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a Bible verse, theological concept, or archaeological evidence..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none outline-none text-ink placeholder:text-ink-light/40 text-sm leading-relaxed max-h-40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-leather text-parchment flex items-center justify-center hover:bg-ink transition-colors disabled:opacity-30 disabled:hover:bg-leather"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-ink-light/40 mt-2">
            Powered by OpenAI Agents SDK &middot; Reformed theological
            perspective
          </p>
        </form>
      </footer>
    </div>
  );
}
