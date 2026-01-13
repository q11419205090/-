import type { ScriptConfig } from "@/types/script";
import { yinshiLingyuan } from "./yinshi-lingyuan";

export const scripts: ScriptConfig[] = [yinshiLingyuan];

export const getScriptById = (id: string) =>
  scripts.find((script) => script.id === id);
