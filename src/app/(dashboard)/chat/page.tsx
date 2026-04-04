"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history = [...messages, userMsg];
      const res = await api.hub.chat(text, history);
      const reply = res.data?.reply ?? "No response";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <ScrollArea className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-4">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            Start a conversation with the hub assistant.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {error && (
        <p className="text-xs text-red-400 mt-2 px-1">{error}</p>
      )}

      <div className="flex gap-2 mt-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          className="flex-1 resize-none bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 min-h-12 max-h-32"
          disabled={loading}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white self-end"
          size="icon"
        >
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
