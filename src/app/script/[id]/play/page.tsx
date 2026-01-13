import Link from "next/link";
import { notFound } from "next/navigation";
import { getScriptById } from "@/data/scripts";

type PlayPageProps = {
  params: { id: string };
};

export default function PlayPage({ params }: PlayPageProps) {
  const script = getScriptById(params.id);

  if (!script) {
    notFound();
  }

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
            AI 接入中
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <h2 className="text-sm font-semibold text-white">实时状态栏</h2>
            <div className="space-y-3">
              {Object.entries(script.initialStats).map(([key, stat]) => (
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
          </aside>

          <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <div className="flex-1 space-y-4">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                这里将显示 AI 的流式叙事与战斗回合文本。后续会接入
                Streaming 与 [UPDATE]/[DATA] 数值解析器。
              </div>
              <div className="flex flex-wrap gap-2">
                {["精准格挡", "弱点打击", "战技释放", "环境利用"].map(
                  (action) => (
                    <button
                      key={action}
                      disabled
                      className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-xs text-slate-400"
                    >
                      {action}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
              <input
                disabled
                className="flex-1 bg-transparent text-sm text-slate-400 outline-none"
                placeholder="AI 接入后可输入指令..."
              />
              <button
                disabled
                className="rounded-full bg-slate-700 px-4 py-2 text-xs text-slate-300"
              >
                发送
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
