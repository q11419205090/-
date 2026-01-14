"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PlayClient from "./PlayClient";
import { getScriptById, scripts } from "@/data/scripts";

export default function PlayRouteClient() {
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
                  href={`/script/${item.id}/play`}
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

  return <PlayClient script={script} />;
}
