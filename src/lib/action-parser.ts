type ActionPayload = {
  actions?: unknown;
};

const actionPattern = /\[(ACTIONS|SUGGEST)\]([\s\S]*?)\[\/\1\]/g;

const normalizeActions = (raw: unknown): string[] => {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.map((item) => String(item)).filter(Boolean);
  }

  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) {
      return [];
    }
    if (value.includes("\n")) {
      return value
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-*\\d.\\s]+/, "").trim())
        .filter(Boolean);
    }
    if (value.includes("、")) {
      return value.split("、").map((item) => item.trim()).filter(Boolean);
    }
    return [value];
  }

  if (typeof raw === "object") {
    const payload = raw as ActionPayload;
    if (payload.actions) {
      return normalizeActions(payload.actions);
    }
  }

  return [];
};

const unique = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()))).filter(Boolean);

export const extractActionSuggestions = (text: string) => {
  let cleanText = text;
  let actions: string[] = [];

  cleanText = cleanText.replace(actionPattern, (_match, _tag, payload) => {
    try {
      const parsed = JSON.parse(payload);
      actions = actions.concat(normalizeActions(parsed));
    } catch {
      actions = actions.concat(normalizeActions(payload));
    }
    return "";
  });

  return {
    cleanText: cleanText.trim(),
    actions: unique(actions).slice(0, 6),
  };
};
