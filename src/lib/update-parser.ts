export type UpdatePayload = Record<string, unknown>;

const updatePattern = /\[(UPDATE|DATA)\]([\s\S]*?)\[\/\1\]/g;

export const extractUpdatePayloads = (text: string) => {
  const updates: UpdatePayload[] = [];
  let cleanText = text;

  cleanText = cleanText.replace(updatePattern, (match, _tag, payload) => {
    try {
      const parsed = JSON.parse(payload);
      updates.push(parsed);
    } catch {
      updates.push({ raw: payload });
    }
    return "";
  });

  return { cleanText: cleanText.trim(), updates };
};
