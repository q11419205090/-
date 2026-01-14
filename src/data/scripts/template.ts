import type { ScriptConfig } from "@/types/script";

export const scriptTemplate: ScriptConfig = {
  id: "your-script-id",
  title: "剧本标题",
  description: "一句话简介，展示在首页卡片。",
  coverImage: "/images/your-cover.png",
  systemPrompt: `在这里填写完整的 System Prompt。`,
  talentPool: [
    { name: "天赋名称", description: "天赋描述。" },
    { name: "天赋名称", description: "天赋描述。" },
    { name: "天赋名称", description: "天赋描述。" },
  ],
  personalityPool: [
    { name: "性格A", description: "性格A的随口小注解。" },
    { name: "性格B", description: "性格B的随口小注解。" },
    { name: "性格C", description: "性格C的随口小注解。" },
  ],
  initialStats: {
    hp: { label: "HP", value: 100, color: "#22c55e" },
    san: { label: "SAN", value: 100, color: "#38bdf8" },
    sync: { label: "SYNC", value: 0, color: "#a855f7" },
    credits: { label: "学分", value: 100, color: "#f59e0b" },
  },
  status: "available",
  tags: ["标签1", "标签2"],
  quickActions: ["快捷指令1", "快捷指令2"],
};
