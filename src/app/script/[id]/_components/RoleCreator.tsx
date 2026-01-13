"use client";

import { useMemo, useState } from "react";
import type { ScriptConfig } from "@/types/script";
import { getRandomItem, getRandomItems } from "@/lib/random";

type RoleCreatorProps = {
  script: ScriptConfig;
};

const genderOptions = ["男", "女", "其他"];

export default function RoleCreator({ script }: RoleCreatorProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState(genderOptions[0]);
  const [age, setAge] = useState(18);
  const [talents, setTalents] = useState<ScriptConfig["talentPool"]>([]);
  const [personality, setPersonality] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      scriptId: script.id,
      player: {
        name,
        gender,
        age,
        talents,
        personality,
      },
      initialStats: script.initialStats,
    }),
    [age, gender, name, personality, script.id, script.initialStats, talents],
  );

  const handleDrawTalents = () => {
    setTalents(getRandomItems(script.talentPool, 3));
  };

  const handleDrawPersonality = () => {
    setPersonality(getRandomItem(script.personalityPool));
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">角色创建</h2>
        <p className="mt-1 text-sm text-slate-300">
          根据剧本背景生成角色档案，系统将把你的选择封装成 AI 输入。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-200">
          角色姓名
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-white"
            placeholder="输入姓名"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          性别
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-white"
          >
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          年龄
          <input
            type="range"
            min={15}
            max={30}
            value={age}
            onChange={(event) => setAge(Number(event.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-400">当前：{age}</div>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">天赋抽取</h3>
            <button
              onClick={handleDrawTalents}
              className="rounded-full bg-purple-500/90 px-4 py-1 text-xs font-semibold text-white transition hover:bg-purple-500"
            >
              抽取天赋
            </button>
          </div>
          {talents.length === 0 ? (
            <p className="text-xs text-slate-400">暂未抽取天赋。</p>
          ) : (
            <div className="space-y-2">
              {talents.map((talent) => (
                <div
                  key={talent.name}
                  className="rounded-lg border border-white/10 bg-slate-900/70 p-3"
                >
                  <div className="text-sm font-semibold text-white">
                    {talent.name}
                  </div>
                  <div className="text-xs text-slate-300">
                    {talent.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">性格抽取</h3>
            <button
              onClick={handleDrawPersonality}
              className="rounded-full bg-slate-200/90 px-4 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white"
            >
              抽取性格
            </button>
          </div>
          {personality ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white">
              {personality}
            </div>
          ) : (
            <p className="text-xs text-slate-400">暂未抽取性格。</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
        <div className="text-sm font-semibold text-white">封装预览</div>
        <p className="mt-1 text-xs text-slate-400">
          该数据将与剧本 systemPrompt 合并后发送给 AI。
        </p>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-900/70 p-3 text-xs text-slate-200">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </section>
  );
}
