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

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [tool, setTool] = useState<string | null>(null);
  const [cost, setCost] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, thinking, tool]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setStreaming(true);
    setThinking(true);
    setTool(null);
    setCost(0);

    // Empty assistant message to stream into
    let assistantText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const token = localStorage.getItem("token");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${API_URL}/hub/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.text();
        updateLastAssistant(`⚠️ Error: ${err}`);
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });

        // Parse SSE: "event: xxx\ndata: yyy\n\n"
        while (buf.includes("\n\n")) {
          const idx = buf.indexOf("\n\n");
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);

          currentEvent = "";
          let dataStr = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) currentEvent = line.slice(7).trim();
            else if (line.startsWith("data: ")) dataStr = line.slice(6);
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            switch (currentEvent) {
              case "thinking":
                setThinking(true);
                break;
              case "text":
                setThinking(false);
                setTool(null);
                assistantText += data.text || "";
                updateLastAssistant(assistantText);
                break;
              case "tool_use":
                setTool(data.tool || "running...");
                break;
              case "tool_result":
                setTool(null);
                break;
              case "result":
                // Use result text ONLY if we haven't received streaming text
                if (!assistantText && data.text) {
                  assistantText = data.text;
                  updateLastAssistant(assistantText);
                }
                setCost(data.cost_usd || 0);
                break;
              case "done":
                setCost(data.cost_usd || 0);
                break;
            }
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        updateLastAssistant(`⚠️ ${(err as Error).message}`);
      }
    } finally {
      setStreaming(false);
      setThinking(false);
      setTool(null);
      abortRef.current = null;
    }
  }, [input, streaming]);

  function updateLastAssistant(content: string) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === "assistant") last.content = content;
      return [...copy];
    });
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-2rem)] md:h-[calc(100vh-8rem)] md:max-h-[800px]">
      <ScrollArea className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-3 md:p-4">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8 px-2">
            Chat with your Hub AI. It can call skills, read code, and execute tasks.
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
                    "max-w-[90%] md:max-w-[85%] rounded-xl px-3 py-2 md:px-4 md:py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="chat-md">
                      <ReactMarkdown>
                        {msg.content ||
                          (streaming && i === messages.length - 1
                            ? "..."
                            : "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {streaming && (thinking || tool) && (
              <div className="flex items-center gap-2 px-2">
                {thinking && (
                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs animate-pulse">
                    <Brain className="size-3 mr-1" /> Thinking...
                  </Badge>
                )}
                {tool && (
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                    <Wrench className="size-3 mr-1" /> {tool}
                  </Badge>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {cost > 0 && (
        <p className="text-xs text-slate-500 mt-1 px-1">
          Cost: ${cost.toFixed(4)}
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask anything... (Enter to send)"
          className="flex-1 resize-none bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 min-h-[44px] max-h-32 text-base md:text-sm"
          disabled={streaming}
        />
        {streaming ? (
          <Button
            onClick={() => {
              abortRef.current?.abort();
              setStreaming(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white self-end min-h-[44px] min-w-[44px]"
            size="icon"
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white self-end min-h-[44px] min-w-[44px]"
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
