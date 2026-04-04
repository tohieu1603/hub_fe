"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Square, Wrench, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface StreamStatus {
  thinking: boolean;
  tool: string | null;
  cost: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<StreamStatus>({ thinking: false, tool: null, cost: 0 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, status]);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setStreaming(true);
    setStatus({ thinking: true, tool: null, cost: 0 });

    // Add empty assistant message that we'll stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const token = localStorage.getItem("token");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${API_URL}/hub/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.text();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ Error: ${err}` };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7).trim();

            // Next line should be data:
            const dataIdx = lines.indexOf(line) + 1;
            if (dataIdx < lines.length && lines[dataIdx].startsWith("data: ")) {
              const dataStr = lines[dataIdx].slice(6);
              try {
                const data = JSON.parse(dataStr);
                handleSSEEvent(eventType, data);
              } catch {}
            }
          } else if (line.startsWith("data: ")) {
            // Data without explicit event
            try {
              const data = JSON.parse(line.slice(6));
              if (data.event) handleSSEEvent(data.event, data);
            } catch {}
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${(err as Error).message}` };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      setStatus((s) => ({ ...s, thinking: false, tool: null }));
      abortRef.current = null;
    }
  }, [input, streaming]);

  function handleSSEEvent(type: string, data: Record<string, unknown>) {
    switch (type) {
      case "text":
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last.role === "assistant") {
            last.content += (data.text as string) || "";
          }
          return [...copy];
        });
        setStatus((s) => ({ ...s, thinking: false, tool: null }));
        break;

      case "thinking":
        setStatus((s) => ({ ...s, thinking: true }));
        break;

      case "tool_use":
        setStatus((s) => ({ ...s, tool: (data.tool as string) || "running tool" }));
        break;

      case "tool_result":
        setStatus((s) => ({ ...s, tool: null }));
        break;

      case "result":
        setStatus((s) => ({ ...s, cost: (data.cost_usd as number) || 0 }));
        // If we got a final result text and assistant content is empty, use it
        if (data.text) {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last.role === "assistant" && !last.content) {
              last.content = data.text as string;
            }
            return [...copy];
          });
        }
        break;

      case "done":
        setStatus((s) => ({ ...s, cost: (data.cost_usd as number) || s.cost }));
        break;
    }
  }

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
          <p className="text-slate-500 text-sm text-center py-8">Chat with your Hub AI. It can call skills, read code, and execute tasks.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                  msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-100"
                )}>
                  {msg.role === "assistant" ? (
                    <div className="chat-md text-sm">
                      <ReactMarkdown>{msg.content || (streaming && i === messages.length - 1 ? "..." : "")}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming status indicators */}
            {streaming && (
              <div className="flex items-center gap-2 px-2">
                {status.thinking && (
                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs animate-pulse">
                    <Brain className="size-3 mr-1" /> Thinking...
                  </Badge>
                )}
                {status.tool && (
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                    <Wrench className="size-3 mr-1" /> {status.tool}
                  </Badge>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Cost display */}
      {status.cost > 0 && (
        <p className="text-xs text-slate-500 mt-1 px-1">Cost: ${status.cost.toFixed(4)}</p>
      )}

      <div className="flex gap-2 mt-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... (Enter to send)"
          className="flex-1 resize-none bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 min-h-12 max-h-32"
          disabled={streaming}
        />
        {streaming ? (
          <Button onClick={stopStream} className="bg-red-600 hover:bg-red-700 text-white self-end" size="icon">
            <Square className="size-4" />
          </Button>
        ) : (
          <Button onClick={sendMessage} disabled={!input.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white self-end" size="icon">
            <Send className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
