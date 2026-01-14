"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import RoleCreator from "./RoleCreator";
import { getScriptById, scripts } from "@/data/scripts";

export default function ScriptPageClient() {
  const params = useParams<{ id?: string | string[] }>();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const script = useMemo(() => (id ? getScriptById(id) : undefined), [id]);

  if (!script) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← 返回剧本大厅
          </Link>
          <h1 className="text-2xl font-semibold text-white">剧本未找到</h1>
          <p className="text-sm text-slate-300">
            当前路径未匹配到剧本，请从大厅重新进入。
          </p>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
            <div className="text-sm text-slate-300">可用剧本：</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {scripts.map((item) => (
                <Link
                  key={item.id}
                  href={`/script/${item.id}`}
                  className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs text-slate-200 hover:border-purple-400/60"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← 返回剧本大厅
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">{script.title}</h1>
            {script.status && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                {script.status === "available" ? "可用" : "开发中"}
              </span>
            )}
          </div>
          <p className="max-w-3xl text-sm text-slate-300">
            {script.description}
          </p>
          {script.tags && script.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              {script.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <RoleCreator script={script} />

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">进入游戏引擎</h2>
            <p className="mt-1 text-sm text-slate-300">
              跳转至对话页，体验流式输出与数值更新。
            </p>
          </div>
          <Link
            href={`/script/${script.id}/play`}
            className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
          >
            开始游戏
          </Link>
        </div>
      </div>
    </div>
  );
}
