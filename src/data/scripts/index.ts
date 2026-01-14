import type { ScriptConfig } from "@/types/script";
import { yinshiLingyuan } from "./yinshi-lingyuan";

export const scripts: ScriptConfig[] = [yinshiLingyuan];

const normalizeKey = (value: string) =>
  decodeURIComponent(value).trim().toLowerCase();

export const getScriptById = (id: string) => {
  const key = normalizeKey(id);
  const byId = scripts.find((script) => normalizeKey(script.id) === key);
  if (byId) {
    return byId;
  }
  return scripts.find((script) => normalizeKey(script.title) === key);
};
