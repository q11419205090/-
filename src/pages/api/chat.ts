import type { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  systemPrompt: string;
  messages: IncomingMessage[];
  playerProfile?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const { systemPrompt, messages, playerProfile } = req.body as ChatRequest;

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    res.status(500).send("Missing AI_API_KEY.");
    return;
  }

  const baseUrl = process.env.AI_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const actionInstruction =
    "\n\n请在回复末尾附加 [ACTIONS][\"指令1\",\"指令2\"][/ACTIONS]，用于生成下一步按钮；该块不会展示给玩家。";
  const systemContent = playerProfile
    ? `${systemPrompt}\n\n[PLAYER_PROFILE]\n${JSON.stringify(
        playerProfile,
      )}\n[/PLAYER_PROFILE]${actionInstruction}`
    : `${systemPrompt}${actionInstruction}`;

  const messageChars = messages.reduce(
    (sum, message) => sum + message.content.length,
    0,
  );
  const profileChars = playerProfile
    ? JSON.stringify(playerProfile).length
    : 0;

  const payload: Record<string, unknown> = {
    model,
    stream: true,
    messages: [
      { role: "system", content: systemContent },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    res.status(response.status || 500).send(errorText || "AI request failed.");
    return;
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Encoding", "identity");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let wroteFallback = false;
  const extractText = (content: unknown) => {
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part?.text === "string") {
            return part.text;
          }
          if (typeof part?.content === "string") {
            return part.content;
          }
          return "";
        })
        .join("");
    }
    if (content && typeof content === "object") {
      const maybeText = (content as { text?: unknown }).text;
      if (typeof maybeText === "string") {
        return maybeText;
      }
      const maybeContent = (content as { content?: unknown }).content;
      if (typeof maybeContent === "string") {
        return maybeContent;
      }
    }
    return "";
  };
  const flushIfPossible = (response: NextApiResponse) => {
    const maybeFlush = (response as unknown as { flush?: () => void }).flush;
    if (typeof maybeFlush === "function") {
      maybeFlush();
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) {
        continue;
      }
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") {
        res.end();
        return;
      }

      try {
        const json = JSON.parse(data);
        const deltaPayload = json.choices?.[0]?.delta;
        const deltaText = extractText(deltaPayload?.content ?? deltaPayload?.text);
        if (deltaText.length > 0) {
          res.write(deltaText);
          flushIfPossible(res);
          continue;
        }
        const fallbackPayload = json.choices?.[0]?.message;
        const fallbackText = extractText(
          fallbackPayload?.content ?? fallbackPayload?.text,
        );
        if (!wroteFallback && fallbackText.length > 0) {
          wroteFallback = true;
          res.write(fallbackText);
          flushIfPossible(res);
        }
      } catch {
        // Ignore malformed chunks.
      }
    }
  }

  res.end();
}

