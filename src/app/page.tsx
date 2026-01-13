import Image from "next/image";
import Link from "next/link";
import { scripts } from "@/data/scripts";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Universal AI Adventure Platform
          </p>
          <h1 className="text-4xl font-semibold text-white">
            一站式 AI 文游平台
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Image
              src="/images/avatar.png"
              alt="头像"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
            <span>大总裁出品</span>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">剧本大厅</h2>
            <span className="text-xs text-slate-400">
              共 {scripts.length} 个剧本
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <Link
                key={script.id}
                href={`/script/${script.id}`}
                className="group rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition hover:border-purple-400/50 hover:bg-slate-900/70"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/10 bg-slate-950/60 text-xs text-slate-400">
                  {script.coverImage ? (
                    <Image
                      src={script.coverImage}
                      alt={`${script.title} 封面`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    "暂无封面"
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {script.title}
                  </h3>
                  {script.status && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {script.status === "available" ? "可用" : "开发中"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {script.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
