"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ScriptConfig } from "@/types/script";
import type { PlayerProfile } from "@/types/player";
import { extractUpdatePayloads } from "@/lib/update-parser";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type PlayClientProps = {
  script: ScriptConfig;
};

const buildStorageKey = (scriptId: string) => `script:${scriptId}:profile`;

export default function PlayClient({ script }: PlayClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(script.initialStats);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = useMemo(() => buildStorageKey(script.id), [script.id]);
  const quickActions = useMemo(() => script.quickActions ?? [], [script.quickActions]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      setProfile(JSON.parse(raw) as PlayerProfile);
    } catch {
      setProfile(null);
    }
  }, [storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const applyUpdatePayload = (payload: Record<string, unknown>) => {
    setStats((current) => {
      const next = { ...current };
      const keyMap = new Map(
        Object.keys(next).map((key) => [key.toLowerCase(), key]),
      );

      Object.entries(payload).forEach(([key, value]) => {
        const normalized = keyMap.get(key.toLowerCase());
        if (!normalized) {
          return;
        }
        const numericValue =
          typeof value === "number"
            ? value
            : Number.isFinite(Number(value))
              ? Number(value)
              : null;
        if (numericValue === null) {
          return;
        }
        next[normalized] = { ...next[normalized], value: numericValue };
      });

      return next;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) {
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: input.trim() },
      { role: "assistant", content: "" },
    ];
    const assistantIndex = nextMessages.length - 1;
    const conversation = nextMessages.slice(0, -1);

    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: script.systemPrompt,
          messages: conversation,
          playerProfile: profile,
        }),
      });

      if (!response.ok || !response.body) {
        const message = await response.text();
        throw new Error(message || "AI 服务暂时不可用。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        assistantText += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const updated = [...current];
          updated[assistantIndex] = {
            role: "assistant",
            content: assistantText,
          };
          return updated;
        });
      }

      const { cleanText, updates } = extractUpdatePayloads(assistantText);
      setMessages((current) => {
        const updated = [...current];
        updated[assistantIndex] = {
          role: "assistant",
          content: cleanText || "（无回复）",
        };
        return updated;
      });

      updates.forEach((payload) => applyUpdatePayload(payload));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI 服务暂时不可用。";
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={`/script/${script.id}`} className="text-sm text-slate-400">
              ← 返回角色创建
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              {script.title} · 游戏引擎
            </h1>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
            {isStreaming ? "AI 输出中" : "AI 已就绪"}
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <h2 className="text-sm font-semibold text-white">实时状态栏</h2>
            <div className="space-y-3">
              {Object.entries(stats).map(([key, stat]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{stat.label}</span>
                    <span>{stat.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(stat.value, 100)}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {!profile && (
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3 text-xs text-slate-300">
                未检测到角色档案，请返回角色创建页完成配置。
              </div>
            )}
          </aside>

          <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                  输入指令开启对话，AI 会在输出中附带 [UPDATE] 数值变更。
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl border border-white/10 p-3 text-sm whitespace-pre-wrap ${
                        message.role === "user"
                          ? "bg-purple-500/20 text-white"
                          : "bg-slate-950/70 text-slate-200"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {quickActions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={isStreaming}
                    onClick={() => {
                      setInput(action);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs text-slate-200 transition hover:border-purple-400/60 hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                className="flex-1 bg-transparent text-sm text-slate-200 outline-none"
                placeholder="输入指令，比如：调查旧校舍走廊。"
              />
              <button
                onClick={() => void handleSend()}
                disabled={isStreaming}
                className="rounded-full bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isStreaming ? "发送中" : "发送"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
