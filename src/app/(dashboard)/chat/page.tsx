"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import {
  Card,
  Input,
  Button,
  Tag,
  Typography,
  Empty,
} from "antd";
import {
  SendOutlined,
  StopOutlined,
  ToolOutlined,
  RobotOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

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
        updateLastAssistant(`Error: ${err}`);
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
        updateLastAssistant(`Error: ${(err as Error).message}`);
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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <Card
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
        styles={{ body: { flex: 1, overflow: "auto", padding: 16 } }}
        title="Chat với Hub AI"
        extra={cost > 0 && <Text type="secondary" style={{ fontSize: 12 }}>Cost: ${cost.toFixed(4)}</Text>}
      >
        {messages.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chat với Hub AI. Có thể gọi skills, đọc code, dispatch pipeline."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: m.role === "user" ? "#2563eb" : "#f1f5f9",
                    color: m.role === "user" ? "#fff" : "#0f172a",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {m.role === "assistant" ? (
                    <div className="chat-md">
                      <ReactMarkdown>
                        {m.content || (streaming && i === messages.length - 1 ? "..." : "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {streaming && (thinking || tool) && (
              <div style={{ display: "flex", gap: 8 }}>
                {thinking && (
                  <Tag color="purple" icon={<RobotOutlined />}>
                    Thinking...
                  </Tag>
                )}
                {tool && (
                  <Tag color="blue" icon={<ToolOutlined />}>
                    {tool}
                  </Tag>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask anything... (Enter để gửi, Shift+Enter xuống dòng)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={streaming}
          style={{ flex: 1 }}
        />
        {streaming ? (
          <Button
            danger
            type="primary"
            icon={<StopOutlined />}
            onClick={() => {
              abortRef.current?.abort();
              setStreaming(false);
            }}
            style={{ height: "auto" }}
          >
            Stop
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{ height: "auto" }}
          >
            Send
          </Button>
        )}
      </div>
    </div>
  );
}
