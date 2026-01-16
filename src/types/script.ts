export interface ScriptConfig {
  id: string;
  title: string;
  description: string;
  systemPrompt: string;
  talentPool: Array<{ name: string; description: string }>;
  personalityPool: Array<{ name: string; description: string }>;
  initialStats: {
    [key: string]: { label: string; value: number; color: string };
  };
  coverImage?: string;
  status?: "available" | "in-progress";
  tags?: string[];
  quickActions?: string[];
  openingPrompt?: string;
}
