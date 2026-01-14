import type { ScriptConfig } from "@/types/script";

export type PlayerProfile = {
  scriptId: string;
  player: {
    name: string;
    gender: string;
    age: number;
    talents: ScriptConfig["talentPool"];
    personality: ScriptConfig["personalityPool"][number] | null;
  };
  initialStats: ScriptConfig["initialStats"];
};
