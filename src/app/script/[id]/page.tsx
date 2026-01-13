import Link from "next/link";
import { notFound } from "next/navigation";
import RoleCreator from "./_components/RoleCreator";
import { getScriptById } from "@/data/scripts";

type ScriptPageProps = {
  params: { id: string };
};

export default function ScriptPage({ params }: ScriptPageProps) {
  const script = getScriptById(params.id);

  if (!script) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← 返回剧本大厅
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">
              {script.title}
            </h1>
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
              跳转至对话页，后续将接入流式 AI 与数值解析器。
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
